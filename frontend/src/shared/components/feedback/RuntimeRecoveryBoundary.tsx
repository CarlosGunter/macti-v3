"use client";

import { Component, type ReactNode } from "react";
import { Button } from "../../shadcn/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  maxAutoReloads?: number;
}

interface State {
  hasError: boolean;
  error?: Error;
  isRecoverable: boolean;
}

const RECOVERABLE_ERROR_PATTERNS = [
  "Loading chunk",
  "ChunkLoadError",
  "Loading CSS chunk",
  "Failed to fetch dynamically imported module",
  "dynamically imported module",
  "Importing a module script failed",
] as const;

/**
 * RuntimeRecoveryBoundary maneja errores de runtime del cliente y
 * reintenta una recarga controlada para errores recuperables.
 */
export class RuntimeRecoveryBoundary extends Component<Props, State> {
  static defaultProps = {
    maxAutoReloads: 1,
  };

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, isRecoverable: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, isRecoverable: false };
  }

  private isRecoverableRuntimeError(error: Error): boolean {
    if (error.name === "ChunkLoadError") {
      return true;
    }

    return RECOVERABLE_ERROR_PATTERNS.some((pattern) => error.message.includes(pattern));
  }

  private getReloadAttemptsKey(): string {
    return `runtime-recovery-reloads:${window.location.pathname}`;
  }

  private getReloadAttempts(): number {
    const raw = window.sessionStorage.getItem(this.getReloadAttemptsKey());
    const parsed = Number.parseInt(raw ?? "0", 10);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private incrementReloadAttempts() {
    const nextAttempts = this.getReloadAttempts() + 1;
    window.sessionStorage.setItem(this.getReloadAttemptsKey(), String(nextAttempts));
  }

  private canAutoReload(): boolean {
    return this.getReloadAttempts() < (this.props.maxAutoReloads ?? 1);
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const isRecoverable = this.isRecoverableRuntimeError(error);

    this.setState({ isRecoverable });

    if (isRecoverable && this.canAutoReload()) {
      this.incrementReloadAttempts();
      console.warn(
        "RuntimeRecoveryBoundary: error recuperable detectado, recargando...",
        error,
      );

      setTimeout(() => {
        window.location.reload();
      }, 150);
      return;
    }

    console.error("RuntimeRecoveryBoundary: error capturado:", error, errorInfo);
  }

  private handleManualReload = () => {
    window.sessionStorage.removeItem(this.getReloadAttemptsKey());
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="text-center">
              <h2 className="mb-4 text-2xl font-bold">Error al cargar la aplicacion</h2>
              <p className="mb-4 text-gray-600">
                {this.state.isRecoverable
                  ? "Se detecto un error temporal de carga. Puedes intentar recargar."
                  : "Ocurrio un error inesperado. Intenta recargar la pagina."}
              </p>
              <Button type="button" onClick={this.handleManualReload}>
                Recargar ahora
              </Button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

# Módulo EmailService - Gestión de Notificaciones Salientes
# Este servicio centraliza el envío de correos electrónicos mediante el protocolo SMTP.
# Utiliza TLS para garantizar que la comunicación con el servidor de correo sea cifrada.

import smtplib
from dataclasses import dataclass
from email.message import EmailMessage
from uuid import UUID

from app.core.environment import environment


@dataclass
class SendValidationEmailResult:
    success: bool
    message: str | None = None
    token: UUID | None = None
    error: str | None = None


class EmailService:
    """
    Servicio encargado de la comunicación vía Email del sistema MACTI.

    Extrae la configuración del servidor (Host, Puerto, Credenciales) dinámicamente
    del objeto de configuración para asegurar la portabilidad y evitar caché de clase.
    """

    @staticmethod
    def send_validation_email(
        to_email: str,
        token: UUID,
        subject: str | None = None,
        body: str | None = None,
    ) -> SendValidationEmailResult:
        """
        Envía un correo electrónico de validación con un enlace de confirmación.

        Retorna:
            Un dataclass con el estatus del envío.
        """

        frontend_url = environment.FRONTEND_URL
        confirm_link = f"{frontend_url}/registro/confirmacion?token={token}"

        msg = EmailMessage()
        msg["Subject"] = subject or "¡Cuenta MACTI Aprobada! Confirma tu correo"
        msg["From"] = environment.FROM_ADDRESS
        msg["To"] = to_email

        # Construcción del cuerpo del mensaje (Uso de string multilínea para el correo)
        msg.set_content(
            body
            or f"""
            Hola, tu solicitud de cuenta ha sido aprobada.
            Para finalizar el proceso y establecer tu contraseña, haz click en el siguiente enlace:

            {confirm_link}

            Este enlace es personal y tiene una vigencia limitada.
            """,
            subtype="plain",
        )

        try:
            smtp_host = environment.SMTP_HOST
            smtp_port = int(environment.SMTP_PORT)
            smtp_user = environment.SMTP_USER.strip()
            # Elimina cualquier espacio accidental de la contraseña de aplicación de Gmail
            smtp_pass = environment.SMTP_PASS.replace(" ", "").strip()

            # Inicia la conexión SMTP con cifrado TLS.
            with smtplib.SMTP(smtp_host, smtp_port) as smtp:
                smtp.ehlo()
                smtp.starttls()
                smtp.ehlo()
                smtp.login(smtp_user, smtp_pass)
                smtp.send_message(msg)

            return SendValidationEmailResult(
                success=True,
                message=f"Correo enviado exitosamente a {to_email}",
                token=token,
            )

        except Exception as e:
            # Captura errores de autenticación, red o rechazo del servidor SMTP.
            return SendValidationEmailResult(
                success=False,
                error=f"Error en el servidor de correo: {str(e)}",
            )

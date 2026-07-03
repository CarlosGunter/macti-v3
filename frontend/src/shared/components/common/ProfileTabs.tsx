import { BookPlus } from "lucide-react";
import Link from "next/link";
import CreateCourseRequestAutenticatedDialog from "@/domains/courses/components/CreateCourseRequestAutenticatedDialog";
import ListEnrolledCourses from "@/domains/courses/components/ListEnrolledCourses";
import ListCourseRequestsTeachers from "@/domains/users/components/ListCourseRequestsTeachers";

const ProfileTabsMap = {
  EnrolledCourses: "cursos",
  RequestsCourses: "solicitudes",
} as const;
type ProfileTabsType = (typeof ProfileTabsMap)[keyof typeof ProfileTabsMap];

interface ProfileTabsProps {
  institute: string;
  activeTab: string | undefined;
}

export default function ProfileTabs({ institute, activeTab }: ProfileTabsProps) {
  if (!Object.values(ProfileTabsMap).includes(activeTab as ProfileTabsType)) {
    activeTab = ProfileTabsMap.EnrolledCourses;
  }

  return (
    <div className="grid gap-4">
      {/* Horizontal Menu */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <Link
          href={`?tab=${ProfileTabsMap.EnrolledCourses}`}
          className={`px-6 py-3 font-medium text-sm transition-colors ${
            activeTab === ProfileTabsMap.EnrolledCourses
              ? "border-b-2 border-black text-black dark:border-white dark:text-white"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          Mis cursos
        </Link>
        <Link
          href={`?tab=${ProfileTabsMap.RequestsCourses}`}
          className={`px-6 py-3 font-medium text-sm transition-colors ${
            activeTab === ProfileTabsMap.RequestsCourses
              ? "border-b-2 border-black text-black dark:border-white dark:text-white"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          Solicitudes de cursos
        </Link>
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {activeTab === ProfileTabsMap.EnrolledCourses && (
          <div className="grid gap-4">
            <ListEnrolledCourses institute={institute} />
            <div className="flex flex-col gap-3 rounded-2xl border border-border/70 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between py-6 bg-card text-card-foreground">
              <div className="grid gap-1">
                <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <BookPlus className="size-4 text-primary" aria-hidden="true" />
                  Solicitar un curso nuevo
                </p>
                <p className="max-w-prose text-sm text-muted-foreground">
                  Abre una solicitud de un curso nuevo dentro de tu instituto.
                </p>
              </div>

              <CreateCourseRequestAutenticatedDialog institute={institute} />
            </div>
          </div>
        )}
        {activeTab === ProfileTabsMap.RequestsCourses && (
          <ListCourseRequestsTeachers institute={institute} />
        )}
      </div>
    </div>
  );
}

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
      <div className="flex border-b border-gray-400">
        <Link
          href={`?tab=${ProfileTabsMap.EnrolledCourses}`}
          className={`px-6 py-3 font-semibold text-sm transition-colors ${
            activeTab === ProfileTabsMap.EnrolledCourses
              ? "border-b-2 border-accent text-black"
              : "text-gray-500 hover:text-foreground hover:border-b hover:border-gray-500"
          }`}
        >
          Mis cursos
        </Link>
        <Link
          href={`?tab=${ProfileTabsMap.RequestsCourses}`}
          className={`px-6 py-3 font-semibold text-sm transition-colors ${
            activeTab === ProfileTabsMap.RequestsCourses
              ? "border-b-2 border-accent text-black"
              : "text-gray-500 hover:text-foreground hover:border-b hover:border-gray-500"
          }`}
        >
          Solicitudes de cursos
        </Link>
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {activeTab === ProfileTabsMap.EnrolledCourses && (
          <div className="grid gap-4 max-w-6xl mx-auto">
            <ListEnrolledCourses institute={institute} />
            <div className="md:mx-6">
              <div className="flex flex-col gap-3 rounded-2xl shadow-sm sm:flex-row sm:items-center sm:justify-between px-6 py-4 bg-card text-card-foreground w-full ring ring-ring/10">
                <div className="grid gap-1">
                  <p className="flex items-center gap-2 text-foreground text-lg font-extrabold">
                    <BookPlus className="size-5" aria-hidden="true" />
                    Solicitar un curso nuevo
                  </p>
                  <p className="max-w-prose">
                    Abre una solicitud de un curso nuevo dentro de tu instituto.
                  </p>
                </div>
                <CreateCourseRequestAutenticatedDialog institute={institute} />
              </div>
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

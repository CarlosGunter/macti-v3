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
            <div>
              <h2 className="text-2xl font-bold text-foreground">Cursos Inscritos</h2>
              <p className="text-foreground/70">
                Aquí puedes ver todos los cursos en los que estás inscrito.
              </p>
            </div>

            <ListEnrolledCourses institute={institute} />

            <CreateCourseRequestAutenticatedDialog institute={institute} />
          </div>
        )}
        {activeTab === ProfileTabsMap.RequestsCourses && (
          <ListCourseRequestsTeachers institute={institute} />
        )}
      </div>
    </div>
  );
}

import { useMemo, useState, useCallback } from 'react';
import type { BootstrapResponse, Session } from './types';



export function useEntityMaps(bootstrap: BootstrapResponse) {
  const userById = useMemo(() => new Map(bootstrap.users.map((u) => [u.id, u])), [bootstrap.users]);
  const studentById = useMemo(() => new Map(bootstrap.students.map((s) => [s.id, s])), [bootstrap.students]);
  const classById = useMemo(() => new Map(bootstrap.classes.map((c) => [c.id, c])), [bootstrap.classes]);
  const subjectById = useMemo(() => new Map(bootstrap.subjects.map((s) => [s.id, s])), [bootstrap.subjects]);
  const teacherNameById = useMemo(() => {
    return new Map(
      bootstrap.teachers.map((t) => {
        const u = userById.get(t.userId);
        return [t.id, u ? `${u.firstName} ${u.lastName}` : t.employeeNumber];
      }),
    );
  }, [bootstrap.teachers, userById]);

  return { userById, studentById, classById, subjectById, teacherNameById };
}



export function useRoleChecks(session: Session) {
  return useMemo(() => ({
    isAdmin: session.roles.includes('ADMIN'),
    isDirector: session.roles.includes('DIRECTOR'),
    isSecretary: session.roles.includes('SECRETARY'),
    isTeacher: session.roles.includes('TEACHER'),
    isStudent: session.roles.includes('STUDENT'),
    isParent: session.roles.includes('PARENT'),
    isStaff: session.roles.some((r) => ['ADMIN', 'DIRECTOR', 'SECRETARY', 'TEACHER'].includes(r)),
    canManage: session.roles.some((r) => ['TEACHER', 'ADMIN', 'DIRECTOR'].includes(r)),
    canManageSubjects: session.roles.some((r) => ['ADMIN', 'DIRECTOR', 'SECRETARY'].includes(r)),
    canAdminOrSecretary: session.roles.some((r) => ['ADMIN', 'SECRETARY'].includes(r)),
  }), [session.roles]);
}



export function useCrudState() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const resetFeedback = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  const runAction = useCallback(async (action: () => Promise<void>, successMessage?: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await action();
      if (successMessage) setSuccess(successMessage);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Operacja nie powiodła się');
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, success, setError, setSuccess, resetFeedback, runAction };
}



export function useVisibleByStudent<T extends { studentId: string }>(
  data: T[],
  bootstrap: BootstrapResponse,
  session: Session,
): T[] {
  return useMemo(() => {
    if (session.roles.some((r) => ['ADMIN', 'DIRECTOR', 'SECRETARY', 'TEACHER'].includes(r))) {
      return data;
    }
    if (session.roles.includes('STUDENT')) {
      const profile = bootstrap.students.find((s) => s.userId === session.userId);
      return profile ? data.filter((d) => d.studentId === profile.id) : [];
    }
    if (session.roles.includes('PARENT')) {
      const childProfile = bootstrap.students.find((s) =>
        bootstrap.parents.some((p) => p.userId === session.userId && p.id === s.parentId));
      return childProfile ? data.filter((d) => d.studentId === childProfile.id) : [];
    }
    return [];
  }, [data, bootstrap, session]);
}

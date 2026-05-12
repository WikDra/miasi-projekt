import { Box, Button, MenuItem, Stack, TextField } from '@mui/material';
import { useState } from 'react';
import { createClassEntity, createSubject, deleteClassEntity, deleteSubject, updateClassEntity, updateSubject } from '../api';
import { EntityTable } from '../components/EntityTable';
import { ActionButtons, CrudDialog, PageHeader } from '../components/Shared';
import { useCrudState, useEntityMaps, useRoleChecks } from '../hooks';
import type { BootstrapResponse, CreateClassRequest, CreateSubjectRequest, SchoolClass, Session, Subject, UpdateClassRequest, UpdateSubjectRequest } from '../types';
import { formatTimeLabel } from '../utils';

interface ClassesSectionProps {
  bootstrap: BootstrapResponse;
  session: Session;
  onRefreshBootstrap: (preserveSessionOnFailure?: boolean) => Promise<boolean>;
}

export function ClassesSection({ bootstrap, session, onRefreshBootstrap }: ClassesSectionProps) {
  const { isAdmin, isSecretary, canManageSubjects } = useRoleChecks(session);
  const { classById, subjectById, teacherNameById } = useEntityMaps(bootstrap);
  const { loading, error, success, setError, resetFeedback, runAction } = useCrudState();

  const [showAddClass, setShowAddClass] = useState(false);
  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);
  const [className, setClassName] = useState('');
  const [classTeacherId, setClassTeacherId] = useState('');
  const [classSchoolYear, setClassSchoolYear] = useState('');

  const [showAddSubject, setShowAddSubject] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [subjectName, setSubjectName] = useState('');
  const [subjectDescription, setSubjectDescription] = useState('');

  function resetClassForm() {
    setClassName(''); setClassTeacherId(''); setClassSchoolYear('');
    setShowAddClass(false); setEditingClass(null);
    resetFeedback();
  }

  function resetSubjectForm() {
    setSubjectName(''); setSubjectDescription('');
    setShowAddSubject(false); setEditingSubject(null);
    resetFeedback();
  }

  function openEditClass(c: SchoolClass) {
    setClassName(c.name); setClassTeacherId(c.teacherId); setClassSchoolYear(c.schoolYear);
    setEditingClass(c);
  }

  function openEditSubject(s: Subject) {
    setSubjectName(s.name); setSubjectDescription(s.description);
    setEditingSubject(s);
  }

  async function handleAddClass(e: React.FormEvent) {
    e.preventDefault();
    const req: CreateClassRequest = { name: className, teacherId: classTeacherId, schoolYear: classSchoolYear };
    await runAction(async () => {
      await createClassEntity(req, session.token);
      await onRefreshBootstrap(true);
      resetClassForm();
    }, 'Dodano klasę.');
  }

  async function handleEditClass(e: React.FormEvent) {
    e.preventDefault();
    if (!editingClass) return;
    const req: UpdateClassRequest = { name: className, teacherId: classTeacherId, schoolYear: classSchoolYear };
    await runAction(async () => {
      await updateClassEntity(editingClass.id, req, session.token);
      await onRefreshBootstrap(true);
      resetClassForm();
    }, 'Zaktualizowano klasę.');
  }

  async function handleDeleteClass(id: string) {
    if (!window.confirm('Usunąć tę klasę?')) return;
    await runAction(async () => {
      await deleteClassEntity(id, session.token);
      await onRefreshBootstrap(true);
    });
  }

  async function handleAddSubject(e: React.FormEvent) {
    e.preventDefault();
    const req: CreateSubjectRequest = { name: subjectName, description: subjectDescription };
    await runAction(async () => {
      await createSubject(req, session.token);
      await onRefreshBootstrap(true);
      resetSubjectForm();
    }, 'Dodano przedmiot.');
  }

  async function handleEditSubject(e: React.FormEvent) {
    e.preventDefault();
    if (!editingSubject) return;
    const req: UpdateSubjectRequest = { name: subjectName, description: subjectDescription };
    await runAction(async () => {
      await updateSubject(editingSubject.id, req, session.token);
      await onRefreshBootstrap(true);
      resetSubjectForm();
    }, 'Zaktualizowano przedmiot.');
  }

  async function handleDeleteSubject(id: string) {
    if (!window.confirm('Usunąć ten przedmiot?')) return;
    await runAction(async () => {
      await deleteSubject(id, session.token);
      await onRefreshBootstrap(true);
    });
  }

  return (
    <Stack spacing={3} sx={{ maxWidth: '100%', overflow: 'hidden' }}>
      <PageHeader title="Klasy i przedmioty" />

      <Stack spacing={2.5}>
        {(isAdmin || isSecretary) && (
          <Box><Button variant="contained" onClick={() => { resetClassForm(); setShowAddClass(true); }}>Dodaj klasę</Button></Box>
        )}
        <Box sx={{ maxWidth: '100%', overflow: 'hidden' }}>
          <EntityTable title="Klasy" rows={bootstrap.classes} columns={[
            { key: 'name', label: 'Nazwa' },
            { key: 'schoolYear', label: 'Rok szkolny' },
            { key: 'teacherId', label: 'Wychowawca', render: (row) => teacherNameById.get(row.teacherId) ?? row.teacherId },
            { key: 'actions', label: 'Akcje', render: (row) => (
              <ActionButtons onEdit={() => openEditClass(row)} onDelete={() => { void handleDeleteClass(row.id); }} />
            )},
          ]} />
        </Box>
      </Stack>

      {canManageSubjects && (
        <Stack spacing={2.5} sx={{ mt: 3 }}>
          <Box><Button variant="contained" onClick={() => { resetSubjectForm(); setShowAddSubject(true); }}>Dodaj przedmiot</Button></Box>
          <Box sx={{ maxWidth: '100%', overflow: 'hidden' }}>
            <EntityTable title="Przedmioty" rows={bootstrap.subjects} columns={[
              { key: 'name', label: 'Nazwa' },
              { key: 'description', label: 'Opis' },
              { key: 'actions', label: 'Akcje', render: (row) => (
                <ActionButtons onEdit={() => openEditSubject(row)} onDelete={() => { void handleDeleteSubject(row.id); }} />
              )},
            ]} />
          </Box>
        </Stack>
      )}

      {/* Class Dialogs */}
      <CrudDialog open={showAddClass} onClose={resetClassForm} title="Dodaj klasę" error={error} loading={loading} onSubmit={(e) => { void handleAddClass(e); }}>
        <TextField id="nazwa_np_1a_1" name="nazwa_np_1a_1" label="Nazwa (np. 1A)" value={className} onChange={(e) => setClassName(e.target.value)} required fullWidth />
        <TextField id="rok_szkolny_2" name="rok_szkolny_2" label="Rok szkolny" value={classSchoolYear} onChange={(e) => setClassSchoolYear(e.target.value)} required fullWidth />
        <TextField id="wychowawca_3" name="wychowawca_3" select label="Wychowawca" value={classTeacherId} onChange={(e) => setClassTeacherId(e.target.value)} required fullWidth>
          {bootstrap.teachers.map((t) => <MenuItem key={t.id} value={t.id}>{teacherNameById.get(t.id)}</MenuItem>)}
        </TextField>
      </CrudDialog>

      <CrudDialog open={!!editingClass} onClose={resetClassForm} title="Edytuj klasę" error={error} loading={loading} onSubmit={(e) => { void handleEditClass(e); }}>
        <TextField id="nazwa_np_1a_4" name="nazwa_np_1a_4" label="Nazwa (np. 1A)" value={className} onChange={(e) => setClassName(e.target.value)} required fullWidth />
        <TextField id="rok_szkolny_5" name="rok_szkolny_5" label="Rok szkolny" value={classSchoolYear} onChange={(e) => setClassSchoolYear(e.target.value)} required fullWidth />
        <TextField id="wychowawca_6" name="wychowawca_6" select label="Wychowawca" value={classTeacherId} onChange={(e) => setClassTeacherId(e.target.value)} required fullWidth>
          {bootstrap.teachers.map((t) => <MenuItem key={t.id} value={t.id}>{teacherNameById.get(t.id)}</MenuItem>)}
        </TextField>
      </CrudDialog>

      {/* Subject Dialogs */}
      <CrudDialog open={showAddSubject} onClose={resetSubjectForm} title="Dodaj przedmiot" error={error} loading={loading} onSubmit={(e) => { void handleAddSubject(e); }}>
        <TextField id="nazwa_7" name="nazwa_7" label="Nazwa" value={subjectName} onChange={(e) => setSubjectName(e.target.value)} required fullWidth />
        <TextField id="opis_8" name="opis_8" label="Opis" value={subjectDescription} onChange={(e) => setSubjectDescription(e.target.value)} multiline minRows={2} fullWidth />
      </CrudDialog>

      <CrudDialog open={!!editingSubject} onClose={resetSubjectForm} title="Edytuj przedmiot" error={error} loading={loading} onSubmit={(e) => { void handleEditSubject(e); }}>
        <TextField id="nazwa_9" name="nazwa_9" label="Nazwa" value={subjectName} onChange={(e) => setSubjectName(e.target.value)} required fullWidth />
        <TextField id="opis_10" name="opis_10" label="Opis" value={subjectDescription} onChange={(e) => setSubjectDescription(e.target.value)} multiline minRows={2} fullWidth />
      </CrudDialog>
    </Stack>
  );
}

import { Box, Button, Chip, MenuItem, Stack, TextField } from '@mui/material';
import { useState } from 'react';
import { createUser, deleteUser, updateUser } from '../api';
import { EntityTable } from '../components/EntityTable';
import { ActionButtons, CrudDialog, PageHeader } from '../components/Shared';
import { useCrudState, useRoleChecks } from '../hooks';
import type { BootstrapResponse, CreateUserRequest, Session, UpdateUserRequest, User } from '../types';

interface UsersSectionProps {
  bootstrap: BootstrapResponse;
  session: Session;
  onRefreshBootstrap: (preserveSessionOnFailure?: boolean) => Promise<boolean>;
}

const ALL_ROLES = ['ADMIN', 'DIRECTOR', 'SECRETARY', 'TEACHER', 'STUDENT', 'PARENT'];

export function UsersSection({ bootstrap, session, onRefreshBootstrap }: UsersSectionProps) {
  const { isAdmin } = useRoleChecks(session);
  const { loading, error, success, setError, resetFeedback, runAction } = useCrudState();

  const [showAdd, setShowAdd] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [status, setStatus] = useState('ACTIVE');

  function resetForm() {
    setFirstName(''); setLastName(''); setEmail(''); setPassword(''); setSelectedRoles([]); setStatus('ACTIVE');
    setShowAdd(false); setEditingUser(null);
    resetFeedback();
  }

  function openEdit(user: User) {
    setFirstName(user.firstName); setLastName(user.lastName); setEmail(user.email);
    setSelectedRoles(user.roles); setStatus(user.status);
    setPassword('');
    setEditingUser(user);
  }

  async function handleAdd(event: React.FormEvent) {
    event.preventDefault();
    if (selectedRoles.length === 0) return setError('Wybierz przynajmniej jedną rolę.');
    const req: CreateUserRequest = { firstName, lastName, email, password, roles: selectedRoles };
    await runAction(async () => {
      await createUser(req, session.token);
      await onRefreshBootstrap(true);
      resetForm();
    }, 'Dodano użytkownika.');
  }

  async function handleEdit(event: React.FormEvent) {
    event.preventDefault();
    if (!editingUser) return;
    if (selectedRoles.length === 0) return setError('Wybierz przynajmniej jedną rolę.');
    const req: UpdateUserRequest = { firstName, lastName, email, status, roles: selectedRoles };
    await runAction(async () => {
      await updateUser(editingUser.id, req, session.token);
      await onRefreshBootstrap(true);
      resetForm();
    }, 'Zaktualizowano użytkownika.');
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Na pewno usunąć tego użytkownika?')) return;
    await runAction(async () => {
      await deleteUser(id, session.token);
      await onRefreshBootstrap(true);
    });
  }

  return (
    <Stack spacing={3} sx={{ maxWidth: '100%', overflow: 'hidden' }}>
      <PageHeader title="Użytkownicy" />

      {isAdmin && (
        <Box>
          <Button variant="contained" onClick={() => { resetForm(); setShowAdd(true); }}>
            Dodaj użytkownika
          </Button>
        </Box>
      )}

      <Box sx={{ maxWidth: '100%', overflow: 'hidden' }}>
        <EntityTable
          title="Użytkownicy"
          rows={bootstrap.users}
          columns={[
            { key: 'firstName', label: 'Imię' },
            { key: 'lastName', label: 'Nazwisko' },
            { key: 'email', label: 'Email' },
            { key: 'roles', label: 'Role', render: (row) => (
              <Stack direction="row" spacing={0.5} flexWrap="wrap">
                {row.roles.map((r) => <Chip key={r} label={r} size="small" />)}
              </Stack>
            )},
            { key: 'status', label: 'Status', render: (row) => (
              <Chip label={row.status} color={row.status === 'ACTIVE' ? 'success' : 'default'} size="small" />
            )},
            { key: 'actions', label: 'Akcje', render: (row) => (
              <ActionButtons 
                onEdit={() => openEdit(row)} 
                onDelete={isAdmin ? () => { void handleDelete(row.id); } : undefined} 
              />
            )},
          ]}
        />
      </Box>

      <CrudDialog
        open={showAdd} onClose={resetForm} title="Dodaj użytkownika"
        error={error} loading={loading} onSubmit={(e) => { void handleAdd(e); }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField id="imię_1" name="imię_1" label="Imię" value={firstName} onChange={(e) => setFirstName(e.target.value)} required fullWidth />
          <TextField id="nazwisko_2" name="nazwisko_2" label="Nazwisko" value={lastName} onChange={(e) => setLastName(e.target.value)} required fullWidth />
        </Stack>
        <TextField id="email_3" name="email_3" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required fullWidth />
        <TextField id="hasło_4" name="hasło_4" label="Hasło" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required fullWidth />
        <TextField id="role_5" name="role_5" select label="Role" value={selectedRoles} onChange={(e) => setSelectedRoles(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value as string[])} required fullWidth SelectProps={{ multiple: true }}>
          {ALL_ROLES.map((role) => <MenuItem key={role} value={role}>{role}</MenuItem>)}
        </TextField>
      </CrudDialog>

      <CrudDialog
        open={!!editingUser} onClose={resetForm} title="Edytuj użytkownika"
        error={error} loading={loading} onSubmit={(e) => { void handleEdit(e); }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField id="imię_6" name="imię_6" label="Imię" value={firstName} onChange={(e) => setFirstName(e.target.value)} required fullWidth />
          <TextField id="nazwisko_7" name="nazwisko_7" label="Nazwisko" value={lastName} onChange={(e) => setLastName(e.target.value)} required fullWidth />
        </Stack>
        <TextField id="email_8" name="email_8" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required fullWidth />
        <TextField id="status_9" name="status_9" select label="Status" value={status} onChange={(e) => setStatus(e.target.value)} required fullWidth>
          <MenuItem value="ACTIVE">Aktywny</MenuItem>
          <MenuItem value="INACTIVE">Nieaktywny</MenuItem>
        </TextField>
        <TextField id="role_10" name="role_10" select label="Role" value={selectedRoles} onChange={(e) => setSelectedRoles(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value as string[])} required fullWidth SelectProps={{ multiple: true }}>
          {ALL_ROLES.map((role) => <MenuItem key={role} value={role}>{role}</MenuItem>)}
        </TextField>
      </CrudDialog>
    </Stack>
  );
}

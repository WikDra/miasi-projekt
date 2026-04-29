import {
  AppBar,
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
} from '@mui/material';
import type { Theme } from '@mui/material/styles';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import ClassRoundedIcon from '@mui/icons-material/ClassRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import MailRoundedIcon from '@mui/icons-material/MailRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import type { ReactNode } from 'react';
import { useState } from 'react';
import type { SectionKey, Session } from '../types';

interface ShellProps {
  session: Session;
  activeSection: SectionKey;
  onNavigate: (section: SectionKey) => void;
  onLogout: () => void;
  children: ReactNode;
}

const drawerWidth = 280;

export function Shell({ session, activeSection, onNavigate, onLogout, children }: ShellProps) {
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const navItems = [
    { key: 'dashboard' as const, label: 'Pulpit', icon: <DashboardRoundedIcon /> },
    { key: 'users' as const, label: 'Użytkownicy', icon: <PeopleRoundedIcon /> },
    { key: 'classes' as const, label: 'Klasy i plan', icon: <ClassRoundedIcon /> },
    { key: 'grades' as const, label: 'Oceny', icon: <SchoolRoundedIcon /> },
    { key: 'students' as const, label: 'Uczniowie', icon: <SchoolRoundedIcon /> },
    { key: 'messages' as const, label: 'Wiadomości', icon: <MailRoundedIcon /> },
  ];
  const activeNavItem = navItems.find((item) => item.key === activeSection);

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mt: 0.5 }}>
          Panel główny
        </Typography>
      </Box>

      <Divider />

      <List sx={{ px: 1, py: 2, flex: 1 }}>
        {navItems.map((item) => (
          <ListItemButton
            key={item.key}
            selected={activeSection === item.key}
            onClick={() => {
              onNavigate(item.key);
              setMobileOpen(false);
            }}
            sx={{ borderRadius: 3, mx: 1, mb: 0.75 }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>

      <Divider />

      <Box sx={{ p: 2.5 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar sx={{ bgcolor: 'primary.main' }}>{session.fullName.slice(0, 1)}</Avatar>
          <Box>
            <Typography variant="subtitle2">{session.fullName}</Typography>
            <Typography variant="caption" color="text.secondary">
              {session.roles.join(', ')}
            </Typography>
          </Box>
        </Stack>
        <ListItemButton onClick={onLogout} sx={{ mt: 2, borderRadius: 3 }}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <LogoutRoundedIcon />
          </ListItemIcon>
          <ListItemText primary="Wyloguj" />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex' }}>
      <AppBar
        position="fixed"
        color="transparent"
        elevation={0}
        sx={{
          backdropFilter: 'blur(18px)',
          borderBottom: '1px solid rgba(17, 100, 102, 0.12)',
          backgroundColor: 'rgba(255, 250, 242, 0.8)',
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar sx={{ gap: 2 }}>
          {isMobile ? (
            <IconButton edge="start" onClick={() => setMobileOpen(true)}>
              <MenuRoundedIcon />
            </IconButton>
          ) : null}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6">{activeSection === 'dashboard' ? 'Pulpit' : activeNavItem?.label ?? 'Pulpit'}</Typography>
          </Box>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar sx={{ bgcolor: 'secondary.main' }}>{session.fullName.slice(0, 1)}</Avatar>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="subtitle2">{session.fullName}</Typography>
              <Typography variant="caption" color="text.secondary">
                {session.email}
              </Typography>
            </Box>
          </Stack>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="sidebar navigation"
      >
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : true}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              borderRight: '1px solid rgba(17, 100, 102, 0.12)',
              background: 'linear-gradient(180deg, rgba(255,250,242,0.98), rgba(243,239,231,0.98))',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flex: 1,
          p: { xs: 2, md: 4 },
          mt: 10,
          width: { md: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

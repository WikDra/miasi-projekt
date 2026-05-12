import {
  AppBar, Avatar, Box, Button, Drawer, IconButton, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, Stack, Toolbar, Typography, useMediaQuery,
} from '@mui/material';
import type { Theme } from '@mui/material/styles';
import { ThemeContext } from '../theme';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import { useContext } from 'react';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import ClassRoundedIcon from '@mui/icons-material/ClassRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded';
import MailRoundedIcon from '@mui/icons-material/MailRounded';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import type { SectionKey, Session } from '../types';

interface ShellProps {
  session: Session;
  activeSection: SectionKey;
  onNavigate: (section: SectionKey) => void;
  onLogout: () => void;
  children: ReactNode;
}

const drawerWidth = 280;

interface NavItem {
  key: SectionKey;
  label: string;
  icon: ReactNode;
  roles?: string[]; // if set, only these roles see the item
}

const allNavItems: NavItem[] = [
  { key: 'dashboard', label: 'Pulpit', icon: <DashboardRoundedIcon /> },
  { key: 'users', label: 'Użytkownicy', icon: <PeopleRoundedIcon />, roles: ['ADMIN'] },
  { key: 'classes', label: 'Klasy', icon: <ClassRoundedIcon />, roles: ['ADMIN', 'SECRETARY', 'TEACHER', 'DIRECTOR'] },
  { key: 'schedule', label: 'Plan lekcji', icon: <CalendarMonthRoundedIcon /> },
  { key: 'grades', label: 'Oceny', icon: <SchoolRoundedIcon /> },
  { key: 'attendance', label: 'Frekwencja', icon: <FactCheckRoundedIcon /> },
  { key: 'students', label: 'Uczniowie', icon: <SchoolRoundedIcon />, roles: ['ADMIN', 'SECRETARY', 'TEACHER', 'DIRECTOR'] },
  { key: 'messages', label: 'Wiadomości', icon: <MailRoundedIcon /> },
  { key: 'reports', label: 'Raporty', icon: <AssessmentRoundedIcon />, roles: ['ADMIN', 'DIRECTOR'] },
];

export function Shell({ session, activeSection, onNavigate, onLogout, children }: ShellProps) {
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const { mode, toggleMode } = useContext(ThemeContext);

  const navItems = useMemo(
    () => allNavItems.filter((item) => {
      if (!item.roles) return true;
      return session.roles.some((role) => item.roles!.includes(role));
    }),
    [session.roles],
  );

  const activeNavItem = navItems.find((item) => item.key === activeSection);

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 3, pb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main', letterSpacing: '-0.02em' }}>
          School Nexus
        </Typography>
      </Box>
      <Box sx={{ flex: 1, px: 2, overflowY: 'auto' }}>
        <List sx={{ pt: 0 }}>
          {navItems.map((item) => (
            <ListItem key={item.key} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={activeSection === item.key}
                onClick={() => {
                  onNavigate(item.key);
                  if (isMobile) setMobileOpen(false);
                }}
                sx={{
                  borderRadius: 2,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': { backgroundColor: 'primary.dark' },
                    '& .MuiListItemIcon-root': { color: 'inherit' },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: activeSection === item.key ? 'inherit' : 'text.secondary' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: activeSection === item.key ? 700 : 500 }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
      <Box sx={{ p: 2 }}>
        <Button 
          variant="text" 
          color="inherit" 
          fullWidth 
          startIcon={<LogoutRoundedIcon />} 
          onClick={onLogout} 
          sx={{ 
            opacity: 0.8, 
            transition: (theme) => theme.transitions.create(['opacity', 'color', 'background-color']),
            '&:hover': { opacity: 1, color: 'error.main' } 
          }}
        >
          Wyloguj
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      overflow: 'hidden',
      maxWidth: '100vw',
      background: (theme) => theme.palette.mode === 'light'
        ? 'radial-gradient(circle at top left, rgba(17, 100, 102, 0.18), transparent 26%), radial-gradient(circle at top right, rgba(209, 154, 102, 0.18), transparent 24%), linear-gradient(180deg, #f7f2e8 0%, #efe8dc 100%)'
        : 'radial-gradient(circle at top left, rgba(44, 147, 150, 0.15), transparent 26%), radial-gradient(circle at top right, rgba(183, 127, 69, 0.15), transparent 24%), linear-gradient(180deg, #121212 0%, #0a0a0a 100%)',
    }}>
      <AppBar
        position="fixed"
        color="transparent"
        elevation={0}
        sx={{
          backdropFilter: 'blur(18px)',
          borderBottom: '1px solid',
          borderColor: 'divider',
          backgroundColor: (theme) => theme.palette.mode === 'light' ? 'rgba(255, 250, 242, 0.8)' : 'rgba(18, 18, 18, 0.8)',
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
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" noWrap>{activeSection === 'dashboard' ? 'Pulpit' : activeNavItem?.label ?? 'Pulpit'}</Typography>
          </Box>
          <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0, flexShrink: 0 }}>
            <IconButton onClick={toggleMode} color="inherit">
              {mode === 'light' ? <DarkModeRoundedIcon /> : <LightModeRoundedIcon />}
            </IconButton>
            <Avatar sx={{ bgcolor: 'secondary.main' }}>{session.fullName.slice(0, 1)}</Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2" noWrap sx={{ maxWidth: { xs: '30vw', sm: 220 } }}>
                {session.fullName}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap sx={{ display: { xs: 'none', sm: 'block' }, maxWidth: 220 }}>
                {session.email}
              </Typography>
            </Box>
          </Stack>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { xs: 0, md: drawerWidth }, flexShrink: 0 }}
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
              borderRight: '1px solid',
              borderColor: 'divider',
              background: (theme) => theme.palette.mode === 'light'
                ? 'linear-gradient(180deg, rgba(255,250,242,0.98), rgba(243,239,231,0.98))'
                : 'linear-gradient(180deg, rgba(30,30,30,0.98), rgba(18,18,18,0.98))',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 4 },
          mt: 10,
          minWidth: 0,
          maxWidth: '100%',
          overflowX: 'auto',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

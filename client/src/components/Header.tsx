"use client";

import React, { useState } from "react";
import {
  Typography,
  Box,
  Drawer,
  Divider,
  useMediaQuery,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Tooltip,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import { styled, useTheme } from "@mui/material/styles";
import { Add, Settings, Person, Home, Close } from "@mui/icons-material";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

const drawerWidth = 280;
const miniDrawerWidth = 64;

const DrawerStyled = styled(Drawer)<{ open: boolean }>(({ theme, open }) => ({
  width: open ? drawerWidth : miniDrawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  "& .MuiDrawer-paper": {
    width: open ? drawerWidth : miniDrawerWidth,
    background: "linear-gradient(135deg, #f8fafc 0%, #e1e8f0 100%)",
    overflowX: "hidden",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    borderRight: "1px solid rgba(0, 0, 0, 0.08)",
    boxShadow: "2px 0 10px rgba(0,0,0,0.1)",
  },
}));

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

const ListItemStyled = styled(ListItem)<{ open: boolean }>(
  ({ theme, open }) => ({
    minHeight: 48,
    justifyContent: open ? "initial" : "center",
    paddingLeft: theme.spacing(2.5),
    paddingRight: theme.spacing(2.5),
    marginBottom: theme.spacing(0.5),
    borderRadius: "0 25px 25px 0",
    marginRight: theme.spacing(1),
    "&:hover": {
      background: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
      transform: "translateX(5px)",
      transition: "all 0.3s ease",
    },
  })
);

const ListItemIconStyled = styled(ListItemIcon)<{ open: boolean }>(
  ({ theme, open }) => ({
    minWidth: 0,
    marginRight: open ? theme.spacing(3) : "auto",
    justifyContent: "center",
  })
);

const ListItemTextStyled = styled(ListItemText)<{ open: boolean }>(
  ({ open }) => ({
    opacity: open ? 1 : 0,
    transition: "opacity 0.3s ease",
  })
);

export default function Header({ chat }: { chat?: boolean }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [bottomNavValue, setBottomNavValue] = useState(0);

  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);
  const { user } = useSelector((root: RootState) => root.user);

  const menuItems = [
    {
      text: "Home",
      icon: <Home />,
      color: theme.palette.primary.main,
      link: "/chat",
    },
    {
      text: "Profile",
      icon: <Person />,
      color: theme.palette.primary.main,
      link: "/in/" + (user ? user.username : ""),
    },
    {
      text: "New Chat",
      icon: <Add />,
      color: theme.palette.success.main,
      link: "/new",
    },
    {
      text: "Settings",
      icon: <Settings />,
      color: theme.palette.primary.main,
      link: "/settings",
    },
  ];

  if (!user) return null;

  if (isMobile) {
    if (chat) {
      return null;
    }

    return (
      <>
        {/* Mobile Bottom Navigation */}
        <Paper
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          }}
          elevation={8}
        >
          <BottomNavigation
            value={bottomNavValue}
            onChange={(event, newValue) => setBottomNavValue(newValue)}
            sx={{
              background: "transparent",
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              "& .MuiBottomNavigationAction-root": {
                color: "rgba(255,255,255,0.6)",
                "&.Mui-selected": {
                  color: "#fff",
                },
                minWidth: "auto",
              },
            }}
          >
            <BottomNavigationAction
              label="Home"
              icon={<Home />}
              href={"/chat"}
            />
            <BottomNavigationAction
              label="Profile"
              icon={<Person />}
              href={`/in/${user.username}`}
            />
            <BottomNavigationAction label="Add" icon={<Add />} />
            <BottomNavigationAction label="More" icon={<MenuIcon />} />
          </BottomNavigation>
        </Paper>
      </>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        position: "fixed",
        height: "100vh",
        width: "64px",
        zIndex: 1200,
        top: 0,
        left: 0,
      }}
    >
      <DrawerStyled variant="permanent" open={drawerOpen}>
        <DrawerHeader className="justify-center">
          {drawerOpen && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                p: 2,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "#fff",
                borderRadius: "0 0 15px 15px",
                mb: 1,
              }}
            >
              <Close
                onClick={handleDrawerToggle}
                sx={{
                  cursor: "pointer",
                  mr: 2,
                  fontSize: "1.5rem",
                }}
              />
              <Box sx={{ flexGrow: 1 }}>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 600, fontSize: "1.1rem" }}
                >
                  💬 ChatApp
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ opacity: 0.8, fontSize: "0.75rem" }}
                >
                  Connect & Chat Instantly
                </Typography>
              </Box>
            </Box>
          )}
          {!drawerOpen && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                height: "64px",
                borderBottom: "1px solid rgba(0,0,0,0.08)",
              }}
            >
              <MenuIcon
                onClick={handleDrawerToggle}
                sx={{ cursor: "pointer", fontSize: "1.2rem" }}
              />
            </Box>
          )}
        </DrawerHeader>

        {drawerOpen && <Divider />}

        {/* Navigation Menu Items */}
        <List sx={{ px: 0 }}>
          {menuItems.map((item) => (
            <Tooltip
              key={item.text}
              title={!drawerOpen ? item.text : ""}
              placement="right"
            >
              <Link href={item.link} style={{ textDecoration: "none" }}>
                <ListItemStyled open={drawerOpen}>
                  <ListItemIconStyled open={drawerOpen}>
                    {React.cloneElement(item.icon, {
                      sx: { color: item.color, fontSize: "1.2rem" },
                    })}
                  </ListItemIconStyled>
                  <ListItemTextStyled
                    open={drawerOpen}
                    primary={item.text}
                    primaryTypographyProps={{
                      fontWeight: 500,
                      fontSize: "0.9rem",
                    }}
                  />
                </ListItemStyled>
              </Link>
            </Tooltip>
          ))}
        </List>

        <Divider sx={{ mx: drawerOpen ? 2 : 1, my: 1 }} />

        {/* Logout Item */}
        <Tooltip title={!drawerOpen ? "Logout" : ""} placement="right">
          <ListItemStyled open={drawerOpen}>
            <ListItemIconStyled open={drawerOpen}>
              <LogoutIcon
                sx={{ color: theme.palette.error.main, fontSize: "1.2rem" }}
              />
            </ListItemIconStyled>
            <ListItemTextStyled
              open={drawerOpen}
              primary="Logout"
              primaryTypographyProps={{
                fontWeight: 500,
                color: theme.palette.error.main,
                fontSize: "0.9rem",
              }}
            />
          </ListItemStyled>
        </Tooltip>

        {/* App Version Footer */}
        {drawerOpen && (
          <Box
            sx={{
              mt: "auto",
              p: 2,
              textAlign: "center",
              borderTop: "1px solid rgba(0,0,0,0.08)",
            }}
          >
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", display: "block" }}
            >
              Chat App v1.0
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", fontSize: "0.7rem" }}
            >
              © 2024 Made with ❤️
            </Typography>
          </Box>
        )}
      </DrawerStyled>
    </Box>
  );
}

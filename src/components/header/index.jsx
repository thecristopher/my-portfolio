import PropTypes from "prop-types";
import "./index.css";
import {
  AppBar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Slide,
  Toolbar,
  Typography,
  useScrollTrigger,
} from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import { useState } from "react";

export const Header = ({ options = [], ...props }) => {
  const { window } = props;
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: "center" }}>
      <Typography variant="h6" sx={{ my: 2, color: "black" }}>
        Cristopher Cervantes
      </Typography>
      <Divider />
      <List>
        {options.map((option, index) => (
          <ListItem key={index} disablePadding>
            <ListItemButton sx={{ textAlign: "center", color: "black" }}>
              <ListItemText primary={option.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  const container =
    window !== undefined ? () => window().document.body : undefined;

  const HideOnScroll = (props) => {
    const { children, window } = props;

    const trigger = useScrollTrigger({
      target: window ? window() : undefined,
    });

    return (
      <Slide appear={false} direction="down" in={!trigger}>
        {children}
      </Slide>
    );
  };

  HideOnScroll.propTypes = {
    children: PropTypes.element.isRequired,
  };

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar component="nav" sx={{ backgroundColor: "white" }}>
        <HideOnScroll {...props}>
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="Open Drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: "none" } }}
            >
              <MenuIcon sx={{ color: "black" }} />
            </IconButton>
            <Typography
              variant="h6"
              component="div"
              sx={{
                flexGrow: 1,
                display: { xs: "none", sm: "block" },
                color: "black",
              }}
            >
              Cristopher Cervantes
            </Typography>
            <Box sx={{ display: { xs: "none", sm: "block" } }}>
              {options.map((option, index) => (
                <Button key={index} sx={{ color: "black" }}>
                  {option.name}
                </Button>
              ))}
            </Box>
          </Toolbar>
        </HideOnScroll>
      </AppBar>
      <nav>
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: 240,
            },
          }}
        >
          {drawer}
        </Drawer>
      </nav>
    </Box>
  );
};

Header.propTypes = {
  options: PropTypes.array.isRequired,
  window: PropTypes.func,
};

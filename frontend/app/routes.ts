import { index, type RouteConfig, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("administration", "./routes/Administration.tsx"),
    route("recruit", "./routes/recruit.tsx"),
    route("login", "./routes/login.tsx"),
    route("survey", "./routes/survey.tsx"),
    route("register", "./routes/register.tsx"),
    route("profile", "./routes/profile.tsx"),
] satisfies RouteConfig;

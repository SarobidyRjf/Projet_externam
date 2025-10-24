//definissena ato @contant menu ny action sy subject (permission)

type SidebarSubItem = {
  icon?: string;
  title: string;
  url: string;
  hideForRoles?: string[]
  actions?: string
  subject?: string
  // Liste optionnelle d'actions disponibles spécifiques à ce sous-menu
  // Si non fourni, on utilisera un catalogue par défaut
  availableActions?: string[]
};

export type SidebarLink = {
  title: string;
  url: string;
  icon?: string;
  isActive?: boolean;
  actions?: string;
  subject?: string[] | string;
  items?: SidebarSubItem[];
};

export type SidebarGroup = {
  label: string;
  links?: SidebarLink[];
};

const sidebar_groups: SidebarGroup[] = [
  {
    label: "General",
    links: [
      {
        title: "Dashboard",
        url: "/",
        icon: "hugeicons:dashboard-square-01",
        actions: 'read',
        subject: 'LeadMeta',
      },
      {
        title: "Lead Externam",
        url: "/contacts",
        icon: "hugeicons:user-group",
        actions: 'read',
        subject: 'LeadMeta',
        items: [
          {
            title: "Tous les contacts",
            url: "/lead/",
            hideForRoles: ["commercial"]
          },
          {
            title: "Mes leads",
            url: "/manage-leads",
          },
          // {
          //   title: "Logiciel",
          //   url: "/lead/logiciel",
          // }
        ],
      },
      {
        title: "Montage et Graphique",
        url: "/montage",
        icon: "tabler:brand-meta",
        actions: 'read',
        subject: 'Montage',
        items: [
          {
            title: "Logiciel",
            url: "/lead/logiciel",
             hideForRoles: ["commercial"]
          },
          {
            title: "videos",
            url: "/montage",
             hideForRoles: ["commercial"]
          }
        ]
      },
      {
        title: "Academy",
        url: "/academy",
        icon: "tabler:book",
        actions: 'read',
        subject: 'Tutorial',
        items: [
          {
            title: "Contenus",
            url: "/academy",
            actions: 'read',
            subject: 'TutorialContent'
          },
          {
            title: "Gestion (Admin)",
            url: "/academy/admin",
            hideForRoles: ["commercial"],
            actions: 'read',
            subject: 'TutorialAdmin'
          },
          {
            title: "Suivi",
            url: "/academy/tracking",
            actions: 'read',
            subject: 'TutorialTracking'
          }
        ]
      },
      // {
      //   title: "Apps",
      //   url: "/apps",
      //   icon: "hugeicons:package",
      // },
      // {
      //   title: "Tasks",
      //   url: "/tasks",
      //   icon: "hugeicons:blockchain-06",
      // },
      
    ],
  },
  {
    label: "Autres",

    links: [
      {
        title: "Comptes",
        url: "#",
        icon: "tabler:user",
        isActive: false,
        items: [
          {
            title: "Profil",
            url: "/profile",
          },
          {
            title: "Tous les comptes",
            url: "/account",
          },
          {
            title: "Gestion des rôles",
            url: "/roles",
          },
        ],
      },
      // {
      //   title: "Auth",
      //   url: "#",
      //   icon: "hugeicons:locked",
      //   isActive: false,
      //   items: [
      //     {
      //       title: "Sign-in (simple)",
      //       url: "/sign-in-1",
      //     },
      //     {
      //       title: "Sign-in (2 Col)",
      //       url: "/sign-in-2",
      //     },
      //     {
      //       title: "Sign-up",
      //       url: "/sign-up",
      //     },
      //     {
      //       title: "Forgot Password",
      //       url: "/forgot-password",
      //     },
      //     {
      //       title: "OTP",
      //       url: "/otp",
      //     },
      //   ],
      // },
      // {
      //   title: "Errors",
      //   url: "#",
      //   icon: "hugeicons:bug-01",
      //   isActive: false,
      //   items: [
      //     {
      //       icon: "tabler:lock",
      //       title: "Unauthorized",
      //       url: "/401",
      //     },
      //     {
      //       icon: "tabler:forbid",
      //       title: "Forbidden",
      //       url: "/403",
      //     },
      //     {
      //       icon: "tabler:error-404",
      //       title: "Not Found",
      //       url: "/404",
      //     },
      //     {
      //       icon: "tabler:server-off",
      //       title: "Internal Server Error",
      //       url: "/500",
      //     },
      //     {
      //       icon: "tabler:plug-off",
      //       title: "Maintenance Error",
      //       url: "/503",
      //     },
      //   ],
      // },
    ],
  },
];

export default sidebar_groups;

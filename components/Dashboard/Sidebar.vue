<script setup lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
  type SidebarProps,
} from "@/components/ui/sidebar";

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  ChevronRight,
  CreditCard,
  LogOut,
  Sparkles,
} from "lucide-vue-next";

import TeamSwitcher from "~/components/TeamSwitcher.vue";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import data from "~/constants/data";
import sidebar_groups, { type SidebarLink } from "~/constants/sidebar_links";
import { useAuthStore } from "~/stores/auth";
const { logout } = useAuthStore();
const { userConnected, ability } = storeToRefs(useAuthStore());

const deconnexion = () => {
  console.log("Déconnexion");
  logout();
};

const props = withDefaults(defineProps<SidebarProps>(), {
  collapsible: "icon",
  variant: "floating",
});


// filtrena ny sidebar groups araka ny permission an'ny user zay vo mappena ao amle vfor
const filteredSidebarGroups = computed(() => {
  const abilityInstance = ability.value
  const currentRole = userConnected.value?.role?.name ?? null

  return sidebar_groups
    .map(group => {
      const links = Array.isArray(group.links) ? group.links : [];

      const filteredLinks = links
        .map<SidebarLink>(link => {
          if (!link.items) return link;

          const filteredItems = link.items
            // filtre par hideForRoles
            .filter(subItem => {
              if (!subItem.hideForRoles || subItem.hideForRoles.length === 0) {
                return true;
              }

              if (!currentRole) {
                return true;
              }

              return !subItem.hideForRoles.includes(currentRole);
            })
            // filtre par permission CASL au niveau du sous-menu si défini
            .filter(subItem => {
              if (subItem.actions && subItem.subject) {
                return abilityInstance?.can(subItem.actions as any, subItem.subject as any) ?? false;
              }
              return true;
            });

          if (filteredItems.length === 0) {
            const { items, ...linkWithoutItems } = link;
            return linkWithoutItems;
          }

          return {
            ...link,
            items: filteredItems,
          };
        })
        .filter(link => {
          if (link.actions && link.subject) {
            return abilityInstance?.can(link.actions, link.subject) ?? false;
          }

          return true;
        })
        .filter(link => {
          if (Array.isArray(link.items)) {
            return link.items.length > 0;
          }

          return true;
        });


      return {
        ...group,
        links: filteredLinks
      };
    })
    .filter(group => group.links && group.links.length > 0);
});

// This is sample data.

const { isMobile, state, toggleSidebar } = useSidebar();
</script>

<template>
  <ClientOnly>
    <Sidebar v-bind="props">
      <SidebarHeader>
        <TeamSwitcher :teams="data.teams" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup v-for="group in filteredSidebarGroups" :key="group.label">
          <SidebarGroupLabel>{{ group.label }}</SidebarGroupLabel>
          <SidebarMenu v-if="state == 'expanded'">
            <template v-for="item in group.links" :key="item.title">
              <Collapsible
                v-if="item.items"
                as-child
                class="group/collapsible"
                :defaultOpen="false"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger as-child>
                    <SidebarMenuButton
                      class="cursor-pointer"
                      :tooltip="item.title"
                    >
                      <Icon v-if="item.icon" :name="item.icon" />

                      <span>{{ item.title }}</span>
                      <ChevronRight
                        class="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
                      />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem
                        v-for="subItem in item.items"
                        :key="subItem.title"
                      >
                        <SidebarMenuSubButton as-child>
                          <NuxtLink
                            :to="subItem.url"
                            class="flex items-center gap-2"
                            @click="isMobile && toggleSidebar()"
                          >
                            <Icon v-if="subItem.icon" :name="subItem.icon" />
                            <span>{{ subItem.title }}</span>
                          </NuxtLink>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              <SidebarMenuButton
                v-else
                as-child
                class="cursor-pointer"
                :tooltip="item.title"
              >
                <NuxtLink
                  :to="item.url"
                  class="flex items-center gap-2"
                  @click="isMobile && toggleSidebar()"
                >
                  <Icon v-if="item.icon" :name="item.icon" />
                  <span>{{ item.title }}</span>
                </NuxtLink>
              </SidebarMenuButton>
            </template>
          </SidebarMenu>

          <SidebarMenu v-else>
            <SidebarMenuItem as-child>
              <template v-for="item in group.links" :key="item.title">
                <DropdownMenu v-if="item.items">
                  <DropdownMenuTrigger as-child>
                    <SidebarMenuButton
                      class="cursor-pointer"
                      :tooltip="item.title"
                    >
                      <Icon v-if="item.icon" :name="item.icon" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    class="w-[--reka-dropdown-menu-trigger-width] rounded-lg"
                    :side="isMobile ? 'bottom' : 'right'"
                    align="start"
                    :side-offset="4"
                  >
                    <DropdownMenuLabel>
                      {{ item.title }}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup
                      v-for="subItem in item.items"
                      :key="subItem.title"
                    >
                      <NuxtLink
                        :to="subItem.url"
                        @click="isMobile && toggleSidebar()"
                      >
                        <DropdownMenuItem
                          class="flex cursor-pointer items-center gap-2"
                        >
                          <Icon v-if="subItem.icon" :name="subItem.icon" />

                          {{ subItem.title }}
                        </DropdownMenuItem>
                      </NuxtLink>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>

                <NuxtLink
                  v-else
                  :to="item.url"
                  @click="isMobile && toggleSidebar()"
                >
                  <SidebarMenuButton
                    class="cursor-pointer"
                    :tooltip="item.title"
                  >
                    <Icon v-if="item.icon" :name="item.icon" />
                  </SidebarMenuButton>
                </NuxtLink>
              </template>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <SidebarMenuButton
                  size="lg"
                  class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar class="h-8 w-8 rounded-lg">
                    <AvatarImage
                      :src="data.user.avatar"
                      :alt="data.user.name"
                    />
                    <AvatarFallback class="rounded-lg"> MD </AvatarFallback>
                  </Avatar>
                  <div class="grid flex-1 text-left text-sm leading-tight">
                    <span class="truncate font-medium">{{userConnected?.nom }} {{ userConnected?.prenom }}</span>
                    <span class="truncate text-xs">{{userConnected?.email }}</span>
                  </div>
                  <ChevronsUpDown class="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                class="w-[--reka-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                :side="isMobile ? 'bottom' : 'right'"
                align="end"
                :side-offset="4"
              >
                <DropdownMenuLabel class="p-0 font-normal">
                  <div
                    class="flex items-center gap-2 px-1 py-1.5 text-left text-sm"
                  >
                    <Avatar class="h-8 w-8 rounded-lg">
                      <AvatarImage
                        :src="data.user.avatar"
                        :alt="data.user.name"
                      />
                      <AvatarFallback class="rounded-lg"> MD </AvatarFallback>
                    </Avatar>
                    <div class="grid flex-1 text-left text-sm leading-tight">
                      <span class="truncate font-semibold">{{
                        data.user.name
                      }}</span>
                      <span class="truncate text-xs">{{
                        data.user.email
                      }}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <BadgeCheck />
                    Compte
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Bell />
                    Notifications
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut />
                  <div @click="deconnexion">
                    Déconnexion
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  </ClientOnly>
</template>

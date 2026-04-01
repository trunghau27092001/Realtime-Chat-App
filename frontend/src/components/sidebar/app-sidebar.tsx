"use client";

import { NavUser } from "@/components/sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Moon, Sun } from "lucide-react";
import { Switch } from "../ui/switch";
import CreateNewChat from "../chat/CreateNewChat";
import NewGroupChatModal from "../chat/NewGroupChatModal";
import GroupChatList from "../chat/GroupChatList";
import AddFriendModal from "../chat/AddFriendModal";
import DirectMessageList from "../chat/DirectMessageList";
import { useThemeStore } from "@/store/useThemeStore";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { isDark, toggleTheme } = useThemeStore();

  // useEffect(() => {
  //   if (isDark) {
  //     document.documentElement.classList.add("dark");
  //   } else document.documentElement.classList.remove("dark");
  // }, [isDark]);

  return (
    <Sidebar variant="inset" {...props}>
      {/* Heaeder */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="bg-gradient-primary"
              //làm cho nền có màu gradient tím hồng như thiết kế
              asChild
            >
              <a href="#">
                <div className="flex w-full items-center px-2 justify-between">
                  <h1 className="text-xl font-bold text-white">TH</h1>
                  <div className="flex items-center gap-2">
                    <Sun className="size-4 text-white/80" />
                    {/* từ lucide-react */}
                    <Switch
                      //Cái component Switch này sẽ tải từ shadcn, sau khi tải xong thì import từ ../ui
                      checked={isDark} //prop này lưu trạng thái của nút true/false: false bên trái, true bên phải
                      onCheckedChange={toggleTheme} //prop này xử lí khi bật tắt nút
                      className="data-[state=checked]:bg-background/80 cursor-pointer"

                      //oke tới đây thì tạm thời cái sidebar đang hơi hẹp nên nếu muốn chỉnh rộng ra xí thì sẽ vào component Sidebar để chỉnh
                    />
                    <Moon className="size-4 text-white/80" />
                    {/* từ lucide-react */}
                  </div>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      {/* Content */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            {/* SidebarGroup và SidebarGroupContent đều từ shadcn */}
            <CreateNewChat />
            {/* Create New Chat cũng là component tự tạo */}
          </SidebarGroupContent>
        </SidebarGroup>
        {/* New chat: là 1 sidebarGroup */}

        <SidebarGroup>
          <SidebarGroupLabel>Nhóm chat</SidebarGroupLabel>
          {/* Sử dụng component thì nó sẽ auto sắp xếp theo vị trí của shadcn nên không cần css lại, tượng tự thì label sẽ nằm bên tay trái */}
          <SidebarGroupAction title="Tạo nhóm" className="cursor-pointer">
            <NewGroupChatModal />
            {/* Component này sẽ tự tạo */}
          </SidebarGroupAction>
          <SidebarGroupContent>
            <GroupChatList />
            {/* Component này sẽ tự tạo */}
          </SidebarGroupContent>
        </SidebarGroup>
        {/* Group Chat: là 1 sidebarGroup  */}

        <SidebarGroup>
          <SidebarGroupLabel>Bạn bè</SidebarGroupLabel>
          {/* Sử dụng component thì nó sẽ auto sắp xếp theo vị trí của shadcn nên không cần css lại, tượng tự thì label sẽ nằm bên tay trái */}
          <SidebarGroupAction title="Kết bạn" className="cursor-pointer">
            <AddFriendModal />
            {/* Component này sẽ tự tạo */}
          </SidebarGroupAction>
          <SidebarGroupContent>
            <DirectMessageList />
            {/* Component này sẽ tự tạo */}
          </SidebarGroupContent>
        </SidebarGroup>
        {/* Direct Message: là 1 sidebarGroup có cấu trúc tương tự groupChat  */}
      </SidebarContent>
      <SidebarFooter>{/* <NavUser user={data.user} /> */}</SidebarFooter>
    </Sidebar>
  );
}

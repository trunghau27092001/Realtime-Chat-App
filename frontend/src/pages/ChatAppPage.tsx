import ChatWindowLayout from "@/components/chat/ChatWindowLayout";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

const ChatAppPage = () => {
  return (
    //Bọc toàn bộ giao diện bằng SidebarProvider
    <SidebarProvider>
      <AppSidebar /> {/*Đây là phần sidebar ở bên trái giao diện*/}
      <div className="flex h-screen w-full  p-2">
        <ChatWindowLayout /> {/* Đây là phần khung chat */}
      </div>
    </SidebarProvider>
  );
};

export default ChatAppPage;

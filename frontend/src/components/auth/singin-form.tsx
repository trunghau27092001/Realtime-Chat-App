import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/store/useAuthStore";
import { Navigate, useNavigate } from "react-router";
import { useEffect } from "react";

const signinSchema = z.object({
  username: z.string().min(3, "Tên đăng nhập phải có ít nhất 3 ký tự"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});
type SigninFormValues = z.infer<typeof signinSchema>;

export function SignInForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { signIn, accessToken, refreshToken } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SigninFormValues>({
    resolver: zodResolver(signinSchema),
  });

  const onSubmit = async (data: SigninFormValues) => {
    const { username, password } = data;

    const rsSignIn = await signIn(username, password);
    if (rsSignIn) {
      navigate("/");
    }
  };

  useEffect(() => {
    if (!accessToken) {
      refreshToken();
    }
  }, [accessToken, refreshToken]);
  if (accessToken) {
    return <Navigate to="/" replace />;
  }
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 border-border">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6 ">
              {/* header- logo */}
              <div className="flex flex-col items-center text-center gap-2">
                <a href="/" className="mt-auto block w-fit text-center">
                  <img src="logo.svg" alt="Logo" />
                </a>

                <h1 className="text-2xl font-bold">Đăng nhập</h1>
                <p className="text-muted-foreground text-balance">
                  Dăng nhập để bắt đầu!
                </p>
              </div>

              {/* username */}
              <div className="flex flex-col gap-3">
                <Label htmlFor="username" className="block text-sm">
                  Tên đăng nhập
                </Label>
                <Input
                  type="text"
                  id="username"
                  placeholder="Tên đăng nhập"
                  {...register("username")}
                ></Input>
                {errors.username && (
                  <p className="text-destructive">{errors.username.message}</p>
                )}
              </div>
              {/* password  */}
              <div className="flex flex-col gap-3">
                <Label htmlFor="password" className="block text-sm">
                  Mật khẩu
                </Label>
                <Input
                  type="password"
                  id="password"
                  {...register("password")}
                ></Input>
                {errors.password && (
                  <p className="text-destructive">{errors.password.message}</p>
                )}
              </div>
              {/* nút đăng nhập */}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                Đăng nhập
              </Button>

              <div className="text-center text-sm">
                Chưa có tài khoản?{" "}
                <a href="/signup" className="underline underline-offset-4">
                  Đăng kí
                </a>
              </div>
            </div>
          </form>
          <div className="bg-muted relative hidden md:block">
            <img
              src="/placeholder.png"
              alt="Image"
              className="absolute top-1/2 -translate-y-1/2 object-cover"
            />
          </div>
        </CardContent>
      </Card>
      <div className="px-6 text-center">
        {/* By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>. */}
      </div>
    </div>
  );
}

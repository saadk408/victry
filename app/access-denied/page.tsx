import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

// Access denied page with reason explanation
export default function AccessDeniedPage({
  searchParams,
}: {
  searchParams: { reason?: string };
}) {
  // Get the reason from query params
  const reason = searchParams.reason || "permission";

  // Define messages based on reason
  const messages = {
    admin: {
      title: "Admin Access Required",
      description: "You need administrator privileges to access this page.",
      action: "Contact your administrator for help.",
    },
    premium: {
      title: "Premium Access Required",
      description: "This feature is only available to premium subscribers.",
      action: "Upgrade your plan to access premium features.",
      actionLink: "/upgrade",
      actionText: "Upgrade Now",
    },
    permission: {
      title: "Access Denied",
      description: "You don't have permission to access this page.",
      action: "Please contact support if you believe this is a mistake.",
    },
  };

  // Get appropriate message
  const message = messages[reason as keyof typeof messages] || messages.permission;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md mx-4 shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {message.title}
          </CardTitle>
          <CardDescription className="text-center">
            {message.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <div className="rounded-full bg-red-100 p-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-red-600"
            >
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <p className="text-sm text-gray-600 text-center">{message.action}</p>
          <div className="flex gap-4 justify-center w-full">
            <Button asChild variant="outline">
              <Link href="/">Home</Link>
            </Button>
            {message.actionLink && (
              <Button asChild>
                <Link href={message.actionLink}>{message.actionText}</Link>
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
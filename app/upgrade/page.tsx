import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function UpgradePage({
  searchParams,
}: {
  searchParams: { redirectTo?: string };
}) {
  // Store the redirect URL to return after upgrade
  const redirectTo = searchParams.redirectTo || "/dashboard";

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Upgrade Your Victry Experience
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Take your resume to the next level with premium features designed to
            maximize your chances of landing that dream job.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Basic Plan */}
          <Card className="relative overflow-hidden border-2">
            <CardHeader className="pb-2">
              <CardTitle>Basic</CardTitle>
              <CardDescription>For casual job seekers</CardDescription>
              <div className="mt-2">
                <span className="text-3xl font-bold">Free</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <ul className="space-y-2 min-h-[240px]">
                <li className="flex items-center">
                  <CheckIcon className="mr-2" />
                  <span>Up to 3 resumes</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="mr-2" />
                  <span>1 tailored resume</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="mr-2" />
                  <span>5 AI tailoring operations</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="mr-2" />
                  <span>Basic ATS compatibility check</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="mr-2" />
                  <span>Standard templates only</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Current Plan
              </Button>
            </CardFooter>
          </Card>

          {/* Premium Plan */}
          <Card className="relative overflow-hidden border-2 border-primary">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium">
              Recommended
            </div>
            <CardHeader className="pb-2">
              <CardTitle>Premium</CardTitle>
              <CardDescription>For serious job hunters</CardDescription>
              <div className="mt-2">
                <span className="text-3xl font-bold">$9.99</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <ul className="space-y-2 min-h-[240px]">
                <li className="flex items-center">
                  <CheckIcon className="mr-2" />
                  <span>Up to 10 resumes</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="mr-2" />
                  <span>20 tailored resumes</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="mr-2" />
                  <span>100 AI tailoring operations</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="mr-2" />
                  <span>Advanced ATS optimization</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="mr-2" />
                  <span>Premium templates</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="mr-2" />
                  <span>Cover letter generation</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="mr-2" />
                  <span>Application tracking</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Upgrade Now</Button>
            </CardFooter>
          </Card>

          {/* Enterprise Plan */}
          <Card className="relative overflow-hidden border-2">
            <CardHeader className="pb-2">
              <CardTitle>Enterprise</CardTitle>
              <CardDescription>For organizations</CardDescription>
              <div className="mt-2">
                <span className="text-3xl font-bold">Contact</span>
                <span className="text-muted-foreground"> for pricing</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <ul className="space-y-2 min-h-[240px]">
                <li className="flex items-center">
                  <CheckIcon className="mr-2" />
                  <span>Unlimited resumes</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="mr-2" />
                  <span>Unlimited tailoring</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="mr-2" />
                  <span>Dedicated account manager</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="mr-2" />
                  <span>API access</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="mr-2" />
                  <span>Custom templates</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="mr-2" />
                  <span>Advanced analytics</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="mr-2" />
                  <span>Team management</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="mr-2" />
                  <span>White labeling options</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Contact Sales
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="text-center">
          <Button asChild variant="outline">
            <Link href={redirectTo}>Return to Previous Page</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
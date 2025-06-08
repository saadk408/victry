// File: /app/_components/layout/footer.tsx
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-background p-6 text-sm">
      <div className="container mx-auto grid grid-cols-1 gap-8 md:grid-cols-4">
        <div>
          <h3 className="mb-4 text-lg font-semibold text-foreground">Victry</h3>
          <p className="text-muted-foreground">
            AI-powered resume builder to help you land your dream job.
          </p>
        </div>

        <div>
          <h3 className="mb-4 text-lg font-semibold text-foreground">Product</h3>
          <ul className="space-y-2">
            <li>
              <Link
                href="/features"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Features
              </Link>
            </li>
            <li>
              <Link
                href="/pricing"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Pricing
              </Link>
            </li>
            <li>
              <Link
                href="/templates"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Templates
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-lg font-semibold text-foreground">Company</h3>
          <ul className="space-y-2">
            <li>
              <Link
                href="/about"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Contact
              </Link>
            </li>
            <li>
              <Link
                href="/blog"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Blog
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-lg font-semibold text-foreground">Legal</h3>
          <ul className="space-y-2">
            <li>
              <Link
                href="/privacy"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                href="/terms"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-8 border-t border-border pt-6 text-center">
        <p className="text-muted-foreground">
          &copy; {new Date().getFullYear()} Victry. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
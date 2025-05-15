// File: /app/_components/layout/footer.tsx
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="border-t bg-white p-6 text-sm dark:bg-gray-800">
      <div className="container mx-auto grid grid-cols-1 gap-8 md:grid-cols-4">
        <div>
          <h3 className="mb-4 text-lg font-semibold">Victry</h3>
          <p className="text-gray-600 dark:text-gray-300">
            AI-powered resume builder to help you land your dream job.
          </p>
        </div>

        <div>
          <h3 className="mb-4 text-lg font-semibold">Product</h3>
          <ul className="space-y-2">
            <li>
              <Link
                href="/features"
                className="text-gray-600 hover:text-blue-600 dark:text-gray-300"
              >
                Features
              </Link>
            </li>
            <li>
              <Link
                href="/pricing"
                className="text-gray-600 hover:text-blue-600 dark:text-gray-300"
              >
                Pricing
              </Link>
            </li>
            <li>
              <Link
                href="/templates"
                className="text-gray-600 hover:text-blue-600 dark:text-gray-300"
              >
                Templates
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-lg font-semibold">Company</h3>
          <ul className="space-y-2">
            <li>
              <Link
                href="/about"
                className="text-gray-600 hover:text-blue-600 dark:text-gray-300"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="text-gray-600 hover:text-blue-600 dark:text-gray-300"
              >
                Contact
              </Link>
            </li>
            <li>
              <Link
                href="/blog"
                className="text-gray-600 hover:text-blue-600 dark:text-gray-300"
              >
                Blog
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-lg font-semibold">Legal</h3>
          <ul className="space-y-2">
            <li>
              <Link
                href="/privacy"
                className="text-gray-600 hover:text-blue-600 dark:text-gray-300"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                href="/terms"
                className="text-gray-600 hover:text-blue-600 dark:text-gray-300"
              >
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-8 border-t pt-6 text-center">
        <p className="text-gray-600 dark:text-gray-300">
          &copy; {new Date().getFullYear()} Victry. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;

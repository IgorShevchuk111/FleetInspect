import React from 'react';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-border dark:border-border bg-white dark:bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-foreground dark:text-white">
              FleetInspect
            </h3>
            <p className="mt-2 text-sm text-muted-foreground dark:text-muted-foreground">
              Smart fleet management for modern businesses
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground dark:text-white uppercase tracking-wider">
              Features
            </h4>
            <ul className="mt-4 space-y-2">
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-primary dark:text-muted-foreground dark:hover:text-muted-foreground"
                >
                  Vehicle Management
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-primary dark:text-muted-foreground dark:hover:text-muted-foreground"
                >
                  Inspections
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-primary dark:text-muted-foreground dark:hover:text-muted-foreground"
                >
                  Maintenance
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground dark:text-white uppercase tracking-wider">
              Support
            </h4>
            <ul className="mt-4 space-y-2">
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-primary dark:text-muted-foreground dark:hover:text-muted-foreground"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-primary dark:text-muted-foreground dark:hover:text-muted-foreground"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-border dark:border-border">
          <p className="text-sm text-muted-foreground dark:text-muted-foreground">
            © {new Date().getFullYear()} FleetInspect
          </p>
        </div>
      </div>
    </footer>
  );
}

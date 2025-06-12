import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useTheme } from "next-themes";
import { Menu, Sun, Moon, Stethoscope } from "lucide-react";
import { useState } from "react";
import { navigateTo } from "@/lib/simple-router";
var navItems = [
    { href: "/", label: "Beranda" },
    { href: "/data-harian", label: "Data Harian" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/arship-tugas", label: "Arship Tugas" },
];
export function Navigation() {
    var location = useLocation()[0];
    var _a = useTheme(), theme = _a.theme, setTheme = _a.setTheme;
    var _b = useState(false), isOpen = _b[0], setIsOpen = _b[1];
    var toggleTheme = function () {
        setTheme(theme === "dark" ? "light" : "dark");
    };
    return (<nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <Stethoscope className="h-8 w-8 text-blue-600"/>
            </div>
            <div>
              <h1 className="font-bold text-lg text-gray-900 dark:text-white">
                Pratek Mandiri
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                drg. Danny Hanggono
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map(function (item) { return (<a key={item.href} href={item.href} onClick={(e) => {
                  e.preventDefault();
                  navigateTo(item.href);
                }}>
                  <span className={"px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ".concat(location === item.href
                ? "bg-blue-600 text-white"
                : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400")}>
                    {item.label}
                  </span>
                </a>); })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600">
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"/>
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"/>
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Mobile menu trigger */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-4 w-4"/>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[240px] sm:w-[300px]">
                <div className="flex flex-col space-y-4 mt-8">
                  {navItems.map(function (item) { return (<a key={item.href} href={item.href} onClick={(e) => {
                      e.preventDefault();
                      navigateTo(item.href);
                      setIsOpen(false);
                    }}>
                      <span className={"block px-3 py-2 rounded-md text-base font-medium transition-colors cursor-pointer ".concat(location === item.href
                ? "bg-blue-600 text-white"
                : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400")}>
                        {item.label}
                      </span>
                    </a>); })}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>);
}

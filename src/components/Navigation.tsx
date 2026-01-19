import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { User, Image, Clock, Menu, X, UserPlus } from "lucide-react";
import { useState } from "react";

const navItems = [
	{ path: "/story", label: "Story Timeline", icon: Clock },
	{ path: "/gallery", label: "Gallery", icon: Image },
	{ path: "/", label: "Profile", icon: User },
];

export const Navigation = () => {
	const location = useLocation();
	const [isOpen, setIsOpen] = useState(false);

	return (
		<nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
			<div className="container mx-auto px-4">
				<div className="flex items-center justify-between h-16 md:h-20">
					{/* Logo */}
					<Link to="/" className="flex items-center gap-2">
						<span className="font-serif text-xl md:text-2xl font-semibold text-foreground">
							ARKUN<span className="text-primary">.CO</span>
						</span>
					</Link>

					{/* Desktop Navigation */}
					<div className="hidden md:flex items-center gap-1">
						{navItems.map((item) => {
							const Icon = item.icon;
							const isActive = location.pathname === item.path;
							return (
								<Link
									key={item.path}
									to={item.path}
									className={cn(
										"flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300",
										isActive
											? "bg-primary text-primary-foreground shadow-warm"
											: "text-muted-foreground hover:text-foreground hover:bg-muted"
									)}
								>
									<Icon className="w-4 h-4" />
									{item.label}
								</Link>
							);
						})}

						{/* Register Button */}
						<Link
							to="/admin/register"
							className="flex items-center gap-2 ml-4 px-4 py-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors shadow-warm"
						>
							<UserPlus className="w-4 h-4" />
							<span className="text-sm font-medium">Register</span>
						</Link>
					</div>

					{/* Mobile Menu Button */}
					<button
						onClick={() => setIsOpen(!isOpen)}
						className="md:hidden p-2 rounded-lg text-foreground hover:bg-muted transition-colors"
					>
						{isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
					</button>
				</div>

				{/* Mobile Navigation */}
				{isOpen && (
					<div className="md:hidden py-4 border-t border-border animate-fade-in">
						{navItems.map((item) => {
							const Icon = item.icon;
							const isActive = location.pathname === item.path;
							return (
								<Link
									key={item.path}
									to={item.path}
									onClick={() => setIsOpen(false)}
									className={cn(
										"flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-300",
										isActive
											? "bg-primary text-primary-foreground"
											: "text-muted-foreground hover:text-foreground hover:bg-muted"
									)}
								>
									<Icon className="w-5 h-5" />
									{item.label}
								</Link>
							);
						})}

						{/* Mobile Register Button */}
						<Link
							to="/admin/register"
							onClick={() => setIsOpen(false)}
							className="flex items-center gap-3 mx-4 mt-4 px-4 py-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors justify-center"
						>
							<UserPlus className="w-5 h-5" />
							<span className="font-medium">Register</span>
						</Link>
					</div>
				)}
			</div>
		</nav>
	);
};

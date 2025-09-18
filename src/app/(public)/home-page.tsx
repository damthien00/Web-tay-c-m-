"use client"
import {DashboardView} from "@/components/app/DashboardView";
import {NavigationBar} from "@/components/app/NavigationBar";
import {useState} from "react";
import {TransactionView} from "@/components/app/TransactionView";
import {AnalyticsView} from "@/components/app/AnalyticsView";
import {SettingsView} from "@/components/app/SettingsView";
import {SavingsGoalsView} from "@/components/app/SavingsGoalsView";
import {SpendingTrendsView} from "@/components/app/SpendingTrendsView";
import {ExpenseReportView} from "@/components/app/ExpenseReportView";
import {ProjectsView} from "@/components/app/ProjectsView";

export default function HomePage() {
	const [currentView, setCurrentView] = useState<
		| 'dashboard'
		| 'transactions'
		| 'analytics'
		| 'settings'
		| 'savings'
		| 'trends'
		| 'reports'
		| 'projects'
	>('dashboard');

	const renderCurrentView = () => {
		switch (currentView) {
			case 'dashboard':
				return <DashboardView onNavigate={setCurrentView} />;
			case 'transactions':
				return <TransactionView />;
			case 'analytics':
				return <AnalyticsView />;
			case 'settings':
				return <SettingsView />;
			case 'savings':
				return <SavingsGoalsView />;
			case 'trends':
				return <SpendingTrendsView />;
			case 'reports':
				return <ExpenseReportView />;
			case 'projects':
				return <ProjectsView />;
			default:
				return <DashboardView onNavigate={setCurrentView} />;
		}
	};

	return (
		<div>
			<div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-yellow-50">
				<div className="max-w-md mx-auto bg-white shadow-xl min-h-screen relative">
					<main className="pb-20">{renderCurrentView()}</main>
					<NavigationBar
						currentView={currentView}
						onViewChange={setCurrentView}
					/>
				</div>
			</div>
		</div>
	);
}

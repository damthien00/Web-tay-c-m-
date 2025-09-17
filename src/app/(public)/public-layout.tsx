import React from "react";
import {TransactionProvider} from "@/contexts/TransactionContext";
import {SavingsGoalProvider} from "@/contexts/SavingsGoalContext";
import {ProjectProvider} from "@/contexts/ProjectContext";

export default function PublicLayout(props: {children: React.ReactNode}) {
	return (
		<>
			<TransactionProvider>
				<SavingsGoalProvider>
					<ProjectProvider>
						{props.children}
					</ProjectProvider>
				</SavingsGoalProvider>
			</TransactionProvider>
		</>
	)
}

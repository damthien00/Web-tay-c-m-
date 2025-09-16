import React from "react";
import {TransactionProvider} from "@/src/contexts/TransactionContext";
import {SavingsGoalProvider} from "@/src/contexts/SavingsGoalContext";
import {ProjectProvider} from "@/src/contexts/ProjectContext";

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

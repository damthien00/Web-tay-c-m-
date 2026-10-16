import React from "react";
import {TransactionProvider} from "@/contexts/TransactionContext";
import {SavingsGoalProvider} from "@/contexts/SavingsGoalContext";
import {ProjectProvider} from "@/contexts/ProjectContext";
import Head from "next/head";
import Header from "@/components/app/Header";
import Footer from "@/components/app/Footer";
import Contact from "@/components/app/Contact";

export default function PublicLayout(props: {children: React.ReactNode}) {
	return (
		<>
			<Header />
			{props.children}
			<Footer/>
			<Contact/>
		</>
	)
}

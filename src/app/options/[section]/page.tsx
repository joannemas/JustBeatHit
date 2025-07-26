'use client'

import { notFound } from "next/navigation"
import PageWrapper from "@/components/Options/PageWrapper"
import PasswordSettings from "@/components/Options/PasswordSettings"
import SubscriptionSettings from "@/components/Options/SubscriptionSettings"
import NotificationsSettings from "@/components/Options/NotificationsSettings"
import DeleteSettings from "@/components/Options/DeleteSettings"

const sectionComponents: Record<string, JSX.Element> = {
    password: <PasswordSettings />,
    subscription: <SubscriptionSettings />,
    notifications: <NotificationsSettings />,
    delete: <DeleteSettings />,
}

export default function OptionsSectionPage({ params }: { params: { section: string } }) {
    const section = params.section
    const component = sectionComponents[section]

    if (!component) return notFound()

    const labelMap: Record<string, string> = {
        password: 'mot de passe',
        subscription: 'abonnement',
        notifications: 'notifications',
        delete: 'supprimer le compte'
    }

    return (
        <PageWrapper section={labelMap[section]}>
            {component}
        </PageWrapper>
    )
}

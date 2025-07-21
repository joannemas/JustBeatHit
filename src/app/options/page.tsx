'use client'
import PageWrapper from "@/components/Options/PageWrapper"
import GeneralSettings from "@/components/Options/GeneralSettings"

export default function OptionsDefaultPage() {
    return (
        <PageWrapper section="général">
            <GeneralSettings />
        </PageWrapper>
    )
}

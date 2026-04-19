// ── Panel heading ─────────────────────────────────────────────────────────────

function PanelHeader() {
    return (
        <div className="flex items-center gap-2 mb-1">
            <div className="h-4 w-1 rounded-full bg-primary" />
            <h2 className="text-xs font-black uppercase tracking-[0.2em] relative top-0.5 text-primary">
                Camera Setup
            </h2>
        </div>
    )
}

export default PanelHeader
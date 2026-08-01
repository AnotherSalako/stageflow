export const clerkAppearance = {
  variables: {
    colorPrimary: "#C8A272",
    colorBackground: "#151412",
    colorInputBackground: "#050505",
    colorInputText: "#EAE6E1",
    colorText: "#EAE6E1",
    colorTextSecondary: "#AFA69D",
    colorNeutral: "#EAE6E1",
    colorDanger: "#E5484D",
    colorSuccess: "#59B37D",
    borderRadius: "1rem",
    fontFamily: "var(--font-inter)",
  },
  elements: {
    rootBox: "w-full max-w-sm",
    card: "shadow-none border border-white/5",
    footerActionLink: "text-cappuccino hover:text-cappuccino-dark",
    // Popover shell
    userButtonPopoverCard: "bg-surface border border-white/10",
    userButtonPopoverMain: "bg-surface",
    userButtonPopoverFooter: "bg-surface",
    // "Manage account" / "Sign out" rows — targeted every way Clerk might key them
    userButtonPopoverActionButton: "text-white hover:bg-white/5",
    userButtonPopoverActionButton__manageAccount: "text-white hover:bg-white/5",
    userButtonPopoverActionButton__signOut: "text-white hover:bg-white/5",
    userButtonPopoverActionButtonText: "!text-white",
    userButtonPopoverActionButtonIcon: "!text-white",
    // Name/email preview at the top of the popover
    userPreviewMainIdentifier: "text-white",
    userPreviewSecondaryIdentifier: "text-stone-400",
    userPreview: "text-white",
  },
};

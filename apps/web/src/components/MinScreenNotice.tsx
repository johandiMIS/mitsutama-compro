export function MinScreenNotice() {
  return (
    <div className="fixed inset-0 z-[100] hidden max-[270px]:flex items-center justify-center bg-background p-6 text-center">
      <p className="text-base text-foreground">Please use a larger screen to access this site.</p>
    </div>
  );
}

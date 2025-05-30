import { GithubLogo } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

export default function Header() {
  return (
    <div className="border-b border-neutral-800 bg-neutral-950/50 backdrop-blur-sm">
      <div className="container mx-auto flex justify-center px-6 py-4">
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-2 border-neutral-700 bg-neutral-900 text-neutral-200 hover:bg-neutral-800"
              asChild
            >
              <a
                href="https://github.com/armancurr/file-converter.git"
                target="_blank"
                rel="noopener noreferrer"
              >
                <GithubLogo className="h-5 w-5" />
                Star on GitHub
              </a>
            </Button>
          </HoverCardTrigger>
          <HoverCardContent className="w-64 text-sm text-neutral-700">
            If you find this helpful, consider starring the repo! It’s open source.
          </HoverCardContent>
        </HoverCard>
      </div>
    </div>
  );
}
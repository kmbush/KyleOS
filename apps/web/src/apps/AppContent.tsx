// Dispatches a window/sheet's app id to its content component. Shell-agnostic:
// the desktop Window and the mobile AppSheet both render this.
import { About } from "./About";
import { Certs } from "./Certs";
import { Contact } from "./Contact";
import { Editor } from "./Editor";
import { Help } from "./Help";
import { Info } from "./Info";
import { Life } from "./Life";
import { Snake } from "./Snake";
import { Work } from "./Work";
import { Writing } from "./Writing";

export function AppContent({ appId }: { appId: string }) {
  if (appId.startsWith("proj:")) return <Work projectId={appId.slice(5)} />;
  switch (appId) {
    case "about":
      return <About />;
    case "writing":
      return <Writing />;
    case "certs":
      return <Certs />;
    case "life":
      return <Life />;
    case "contact":
      return <Contact />;
    case "help":
      return <Help />;
    case "info":
      return <Info />;
    case "editor":
      return <Editor />;
    case "snake":
      return <Snake />;
    default:
      return null;
  }
}

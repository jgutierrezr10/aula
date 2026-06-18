const fs = require('fs');
let c = fs.readFileSync('src/app/components/malla/malla.component.ts', 'utf8');

c = c.replace(/alert\((['`])([\s\S]*?)\1\)/g, "Swal.fire('Atención', $1$2$1, 'warning')");
if (!c.includes("import Swal from 'sweetalert2';")) {
  c = c.replace(/import \{ CommonModule \} from '@angular\/common';/g, "import { CommonModule } from '@angular/common';\nimport Swal from 'sweetalert2';");
}

fs.writeFileSync('src/app/components/malla/malla.component.ts', c);

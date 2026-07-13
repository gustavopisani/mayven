import Journey from './experience/Journey'

/* Home = A EXPERIÊNCIA É A INTERFACE — the full experience lives in src/experience/.
   A base anterior (src/components, src/three) foi retirada do grafo da home nesta
   remodelação; os arquivos permanecem no repositório apenas como referência
   (sem git, remoção seria irreversível) e não entram no bundle. */
export default function App() {
  return <Journey />
}

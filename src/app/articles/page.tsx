import { Article, getArticles } from "@/src/lib/articles";
import moment from "moment";
import 'moment/locale/pt-br';
import Link from "next/link";
import ArticlesAutoScroll from "../../components/articles-auto-scroll";
// import { Tag } from "./[slug]/page";


export default async function ArticlesPage({ searchParams }: { searchParams: { lang?: string } }) {
  const lang = searchParams?.lang || "en";
  const articles = getArticles(lang);
  return (
    <div>
      <h1 className="mb-16 mt-4 text-center text-5xl max-sm:text-4xl">
        {lang === 'en' ? 'Articles' : 'Artigos'}
      </h1>
  {/* ArticlesRedirect removido: listagem normal restaurada */}
  <ArticlesAutoScroll />
      <section className="flex flex-col divide-y divide-zinc-400 overflow-hidden rounded ring-1 ring-zinc-400 dark:divide-zinc-500 dark:ring-zinc-500">
        {articles.map((article: Article) => (
          <Link
            className="flex items-center justify-between px-4 py-2 transition-transform sm:p-4 sm:hover:bg-zinc-100 sm:dark:hover:bg-zinc-800"
            key={article.id}
            href={`/articles/${article.id}`}
          >
            <div id={`article-${article.id}`} className="flex gap-1 gap-x-2 max-sm:flex-col sm:items-center">
              {article.title}{" "}
              <span className="flex gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                {article?.tags?.map((tag) => <span key={tag}>#{tag}</span>)}
              </span>
            </div>
            <span className="text-zinc-500 max-sm:text-sm dark:text-zinc-400">
              {moment(article.date, "YYYY-MM-DD").locale(lang).format("MMM/YYYY")}
            </span>
          </Link>
        ))}
      </section>
    </div>
  );
}

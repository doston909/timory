import numeral from 'numeral';

const API_BASE_FALLBACK = "http://localhost:3003";

export function watchImageUrl(path: string | undefined | null, fallback = "/img/watch/rasm3.png"): string {
  const p = typeof path === "string" ? path.trim() : "";
  if (!p) return fallback;
  if (p.startsWith("http") || p.startsWith("data:")) return p;
  const fromEnv = (process.env.NEXT_PUBLIC_API_GRAPHQL_URL || "").replace(/\/graphql.*$/, "").trim();
  const base = fromEnv || API_BASE_FALLBACK;
  return `${base}/${p.replace(/^\//, "")}`;
}
import { sweetMixinErrorAlert } from './sweetAlert';

export const formatterStr = (value: number | undefined): string => {
	return numeral(value).format('0,0') != '0' ? numeral(value).format('0,0') : '';
};

export const likeTargetWatchHandler = async (likeTargetWatch: any, id: string) => {
	try {
		await likeTargetWatch({
			variables: {
				input: id,
			},
		});
	} catch (err: any) {
		console.log('ERROR, likeTargetWatchHandler:', err.message);
		sweetMixinErrorAlert(err.message).then();
	}
};

export const likeTargetBoardArticleHandler = async (likeTargetBoardArticle: any, id: string) => {
	try {
		await likeTargetBoardArticle({
			variables: {
				input: id,
			},
		});
	} catch (err: any) {
		console.log('ERROR, likeTargetBoardArticleHandler:', err.message);
		sweetMixinErrorAlert(err.message).then();
	}
};

export const likeTargetMemberHandler = async (likeTargetMember: any, id: string) => {
	try {
		await likeTargetMember({
			variables: {
				input: id,
			},
		});
	} catch (err: any) {
		console.log('ERROR, likeTargetMemberHandler:', err.message);
		sweetMixinErrorAlert(err.message).then();
	}
};

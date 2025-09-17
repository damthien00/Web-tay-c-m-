import { getMedias } from "@/actions/media/queries";
import { searchMediaSchema } from "@/actions/media/validations";
import MediaManagement from "@/media-management/MediaManagement";

export default async function MediaPage({ searchParams }: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  const awaited = await searchParams
  const mediaResponse = await getMedias({ ...searchMediaSchema.parse(awaited) })

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Media Management ({mediaResponse.totalCount})</h1>
          <p className="text-muted-foreground mt-2">Manage your media library here.</p>
        </div>
      </div>
      <MediaManagement
        data={mediaResponse.data}
        curPage={mediaResponse.curPage}
        perPage={mediaResponse.perPage}
        pageCount={mediaResponse.pageCount}
        totalCount={mediaResponse.totalCount}
      />
    </div>
  )
}

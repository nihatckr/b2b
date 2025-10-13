import { createWriteStream, statSync, unlinkSync } from "fs";
import { lookup } from "mime-types";
import { nonNull, stringArg } from "nexus";
import { requireAuth } from "../utils/user-role-helper";

// Basit UUID generator (ES module sorununu çözmek için)
const generateUUID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
const uploadDir = "./uploads";

// Helper functions
const getFilesizeInBytes = (filename: string) => {
  const stats = statSync(filename);
  const fileSizeInBytes = stats.size;
  return fileSizeInBytes;
};

const processUpload = async (upload: Promise<any>) => {
  const { createReadStream, filename, mimetype, encoding } = await upload;
  const stream = createReadStream();
  return await storeUpload({ stream, filename, mimetype, encoding });
};

const storeUpload = async ({
  stream,
  filename,
  mimetype,
  encoding,
}: {
  stream: any;
  filename: string;
  mimetype: string;
  encoding: string;
}): Promise<any> => {
  const id = generateUUID();
  const path = `${uploadDir}/${id}-${filename}`;

  return new Promise((resolve, reject) =>
    stream
      .pipe(createWriteStream(path))
      .on("finish", () =>
        resolve({
          id,
          path,
          filename,
          mimetype: mimetype || lookup(path),
          encoding,
          size: getFilesizeInBytes(path),
        })
      )
      .on("error", reject)
  );
};

const processRemove = async (path: string): Promise<any> => {
  console.log("Removed file: ", path);
  try {
    unlinkSync(path);
    return { result: "Deleted" };
  } catch (error) {
    return { result: "Not deleted" };
  }
};

export function fileUploadMutations(t: any) {
  t.field("singleUpload", {
    type: "File",
    args: {
      file: nonNull("Upload"),
    },
    resolve: async (_: any, { file }: any, context: any) => {
      requireAuth(context);

      const { id, path, filename, mimetype, encoding, size } =
        await processUpload(file);

      return await context.prisma.file.create({
        data: {
          id,
          filename,
          path,
          size,
          mimetype,
          encoding,
          description: `Uploaded file: ${filename}`,
        },
      });
    },
  });

  t.nullable.field("deleteFile", {
    type: "File",
    args: {
      id: nonNull(stringArg()),
    },
    resolve: async (_: any, { id }: any, context: any) => {
      requireAuth(context);

      const file = await context.prisma.file.findUnique({ where: { id } });
      if (!file) {
        throw new Error("File not found");
      }

      await processRemove(file.path);

      return await context.prisma.file.delete({
        where: { id },
      });
    },
  });
}

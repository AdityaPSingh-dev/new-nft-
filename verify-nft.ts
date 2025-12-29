import { findMetadataPda, mplTokenMetadata, verifyCollectionV1 } from "@metaplex-foundation/mpl-token-metadata";
import { airdropIfRequired, getExplorerLink, getKeypairFromFile } from "@solana-developers/helpers";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { clusterApiUrl, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { keypairIdentity, publicKey } from "@metaplex-foundation/umi";

const connection = new Connection(clusterApiUrl("devnet"))

const user = await getKeypairFromFile();

await airdropIfRequired(connection, user.publicKey, 1 * LAMPORTS_PER_SOL, 0.5 * LAMPORTS_PER_SOL);
console.log("Loaded user", user.publicKey.toBase58());

const umi = createUmi(connection.rpcEndpoint);
umi.use(mplTokenMetadata());

const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey)
umi.use(keypairIdentity(umiUser))
console.log("Set up Umi instance for user")

const collectionAddress = publicKey("BHrDnd9HvaYWReJPj3W9owCsQJ9MkZ1tuYjHPnCCU29N")
const nftAddress = publicKey("EYAp6iLTUWmnQ4DapXxf7e3p7u96tf8H5WTX4sjzK1qG")

const transaction = await verifyCollectionV1(umi, {
    metadata: findMetadataPda(umi, { mint: nftAddress }),
    collectionMint: collectionAddress,
    authority: umi.identity,
})
transaction.sendAndConfirm(umi, {
    send: { commitment: "finalized" },
    confirm: { commitment: "finalized" },
})

console.log(`Verified NFT ! Address is ${getExplorerLink("address", nftAddress, "devnet")}`);
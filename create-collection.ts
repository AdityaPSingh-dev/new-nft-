import { createNft, fetchDigitalAsset, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { airdropIfRequired, getExplorerLink, getKeypairFromFile } from "@solana-developers/helpers";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { clusterApiUrl, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { generateSigner, keypairIdentity, percentAmount } from "@metaplex-foundation/umi";

const connection = new Connection(clusterApiUrl("devnet"))

const user = await getKeypairFromFile();

await airdropIfRequired(connection, user.publicKey, 1 * LAMPORTS_PER_SOL, 0.5 * LAMPORTS_PER_SOL);
console.log("Loaded user", user.publicKey.toBase58());

const umi = createUmi(connection.rpcEndpoint);
umi.use(mplTokenMetadata());

const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey)
umi.use(keypairIdentity(umiUser))

console.log("Loaded umi user", umiUser.publicKey);
const collectionMint = generateSigner(umi);
const transaction = await createNft(umi, {
    mint: collectionMint,
    name: "Test Collection",
    symbol: "TC",
    uri: "https://raw.githubusercontent.com/Ad-1-tya/sample-nft.json/refs/heads/main/sample-nft.json",
    sellerFeeBasisPoints: percentAmount(0),
    isCollection: true,
})
await transaction.sendAndConfirm(umi, {
    send: { commitment: "finalized" },
    confirm: { commitment: "finalized" },
})

const createdCollectionNft = await fetchDigitalAsset(umi, collectionMint.publicKey)

console.log(`Created collection ! Address is ${getExplorerLink("address", createdCollectionNft.mint.publicKey, "devnet")}`);
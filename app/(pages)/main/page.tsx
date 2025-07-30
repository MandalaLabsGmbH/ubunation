import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from "@/lib/auth";
import { Collectible } from "../../collectible"
import { inter, interTight } from '../../fonts'

async function getCollectibleUrl(): Promise<string | null> { // Declare return type as Promise<string | null>
  try {
 const userCollectibleResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/db/userCollectible`, {
      method: 'GET',
      // No 'headers' needed here.
    });

    if (!userCollectibleResponse.ok) {
      const errorText = await userCollectibleResponse.text();
      console.error("Failed to fetch user collectible:", userCollectibleResponse.status, errorText);
      throw new Error(`Failed to fetch user collectible: ${userCollectibleResponse.status}`);
    }
    const userCollectibleData = await userCollectibleResponse.json();
    const collectibleId = userCollectibleData.collectibleId;

    if (!collectibleId) {
      console.warn("Collectible ID not found for user.");
      return "Collectible ID not found for user";
    }

    const collectibleResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/db/collectible?collectibleId=${collectibleId}`, {
      method: 'GET',
      // No 'headers' needed here.
    });

    if (!collectibleResponse.ok) {
      const errorText = await collectibleResponse.text();
      console.error("Failed to fetch collectible details:", collectibleResponse.status, errorText);
      throw new Error(`Failed to fetch collectible details: ${collectibleResponse.status}`);
    }
    const collectibleData = await collectibleResponse.json();
    return collectibleData.objectUrl;

  } catch (error) {
    console.error("Error in getCollectibleUrl:", error);
    return null;
  }
}

export default async function Main() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }
  const check = await getCollectibleUrl();
  console.log(JSON.stringify(check));
  const interFont = inter;
  const interTightFont = interTight;
  const getUrl = await getCollectibleUrl()

  return <div>
    <section className="Collectible Preview pt-6"><Collectible url={getUrl ? getUrl : 'https://deins.s3.eu-central-1.amazonaws.com/Objects3d/kloppocar/KloppoCar_01.gltf'} /></section>
    <section className={`${interTightFont.className} flex justify-center items-center` }>
      <p className="text-2xl" >
        Wer sammelt, gewinnt
      </p>
      </section>
      <section className={`${interFont.className}`}>
       <div className="flex justify-center items-center"> <p className=" pt-6 text-l text-bold font" >
         Und du hast gerade deinen ersten Schritt gemacht
        </p></div>
        <div className="flex justify-center items-center max-w-200 mx-auto"> <p className=" pt-6 text-l font" >
         Mit jeder weiteren Karte wächst deine Chance auf das Treffen mit <span className='font-bold'>Jürgen Klopp und andere exklusive Preise.</span> Tausche, sammle und sichere dir deinen Platz, sobald unsere App verfügbar ist. Wenn es soweit ist, informieren wir dich.
        </p></div>
      </section>
    
  </div>
  
 }
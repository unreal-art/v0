import { PayEmbed } from "thirdweb/react";
import { base } from "thirdweb/chains";
import { client } from "@/app/components/walletButton";
import { TOKEN_ADDRESS } from "@/app/libs/constants";

export default function EmbeddePay() {

  return (
    <div className='embedded-pay'>
      {client.clientId ? (
        <PayEmbed
          theme={'dark'}
          client={client}
          payOptions={{
            prefillBuy: {
              token: {
                address: TOKEN_ADDRESS,
                name: 'DART TOKEN',
                symbol: 'DART',
              },
              chain: base,
              allowEdits: {
                amount: false, // allow editing buy amount
                token: false, // disable selecting buy token
                chain: false, // disable selecting buy chain
              },
            },
          }}
        />
      ) : null}
    </div>
  );
}

/**
 * Copyright 2026 Circle Internet Group, Inc.  All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { NextRequest, NextResponse } from "next/server";

const CIRCLE_WALLET_SET_URL = "https://api.circle.com/v1/w3s/developer/walletSets";

type CreateWalletSetResponse = {
  data?: {
    walletSet?: Record<string, unknown>;
  };
};

async function createWalletSet(name: string): Promise<CreateWalletSetResponse> {
  if (!process.env.CIRCLE_API_KEY) {
    throw new Error("CIRCLE_API_KEY is missing");
  }

  const response = await fetch(CIRCLE_WALLET_SET_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.CIRCLE_API_KEY}`,
    },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Circle wallet set API failed (${response.status}): ${text}`);
  }

  return (await response.json()) as CreateWalletSetResponse;
}

export async function PUT(req: NextRequest) {
  try {
    const { entityName } = await req.json();

    if (!entityName.trim()) {
      return NextResponse.json(
        { error: "entityName is required" },
        { status: 400 }
      );
    }

    const response = await createWalletSet(entityName);

    if (!response.data) {
      return NextResponse.json(
        "The response did not include a valid wallet set",
        { status: 500 }
      );
    }

    return NextResponse.json({ ...response.data.walletSet }, { status: 201 });
  } catch (error: any) {
    console.error(`Wallet set creation failed: ${error.message}`);
    return NextResponse.json(
      { error: "Failed to create wallet set" },
      { status: 500 }
    );
  }
}

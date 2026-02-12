export async function processRequest<TRequest, TResponse>(
    request: TRequest,
    url: string,
    token: string,
): Promise<TResponse> {
    const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(request),
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    })

    if (!response.ok) {
        // Try to parse as JSON — servers may return error cards as JSON with non-200 status
        try {
            return (await response.json()) as TResponse
        } catch {
            throw new Error(`Request failed with status ${response.status}`)
        }
    }

    return (await response.json()) as TResponse
}

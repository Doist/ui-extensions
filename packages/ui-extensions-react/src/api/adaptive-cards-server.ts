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

    return (await response.json()) as TResponse
}

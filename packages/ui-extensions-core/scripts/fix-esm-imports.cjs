const fs = require('fs')
const path = require('path')

const ESM_DIR = path.join(__dirname, '..', 'dist', 'esm')

function isDirectory(filePath) {
    try {
        return fs.statSync(filePath).isDirectory()
    } catch {
        return false
    }
}

function addJsExtensionToImports(content, filePath) {
    // Match import and export statements with relative paths
    return content.replace(
        /(from\s+)(['"])(\.\.?(?:\/[^'"]*)?)\2/g,
        (match, prefix, quote, relativePath) => {
            // If it already has a file extension, don't modify
            if (
                relativePath.includes('.js') ||
                relativePath.includes('.ts') ||
                relativePath.includes('.json')
            ) {
                return match
            }

            // Resolve the path relative to the current file
            const currentDir = path.dirname(filePath)
            const targetPath = path.resolve(currentDir, relativePath)

            // Check if it's pointing to a directory (index file)
            if (isDirectory(targetPath)) {
                return `${prefix}${quote}${relativePath}/index.js${quote}`
            } else {
                // Check if the file exists with .js extension
                if (fs.existsSync(targetPath + '.js')) {
                    return `${prefix}${quote}${relativePath}.js${quote}`
                }
            }

            return match
        },
    )
}

function processFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8')
    const updatedContent = addJsExtensionToImports(content, filePath)

    if (content !== updatedContent) {
        fs.writeFileSync(filePath, updatedContent)
        console.log(`Fixed imports in: ${path.relative(ESM_DIR, filePath)}`)
    } else {
        // Debug: check if this file has relative imports
        if (content.includes("from './") || content.includes("from '../")) {
            console.log(
                `No changes made to: ${path.relative(ESM_DIR, filePath)} (has relative imports)`,
            )
        }
    }
}

function processDirectory(dirPath) {
    const entries = fs.readdirSync(dirPath)

    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry)
        const stat = fs.statSync(fullPath)

        if (stat.isDirectory()) {
            processDirectory(fullPath)
        } else if (entry.endsWith('.js')) {
            processFile(fullPath)
        }
    }
}

function main() {
    if (!fs.existsSync(ESM_DIR)) {
        console.error(`ESM directory not found: ${ESM_DIR}`)
        process.exit(1)
    }

    console.log('Adding .js extensions to ESM imports...')
    processDirectory(ESM_DIR)
    console.log('Done!')
}

main()

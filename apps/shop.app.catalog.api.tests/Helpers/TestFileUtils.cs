using System.Runtime.CompilerServices;

namespace Shop.App.Catalog.Api.Tests;

public static class TestFileUtils {
    public static string ReadFileAsString(string file, [CallerFilePath]string filePath = "") {
        var directoryPath = Path.GetDirectoryName(filePath);
        var fullPath = Path.Join(directoryPath, file);
        return File.ReadAllText(fullPath);
    }
}
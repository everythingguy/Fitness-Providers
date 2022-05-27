export function reloadImage(src: string) {
    fetch(src, {
        cache: "reload",
        mode: "no-cors"
    }).then(() =>
        document.body
            .querySelectorAll(`img[src='${src}']`)
            .forEach((img: any) => (img.src = src))
    );
}

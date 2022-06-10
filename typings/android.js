const applyMixins = (derivedConstructor, baseConstructors) => {
    baseConstructors.forEach(baseConstructor => {
        Object.getOwnPropertyNames(baseConstructor.prototype)
            .forEach(name => {
            Object.defineProperty(derivedConstructor.prototype, name, Object.getOwnPropertyDescriptor(baseConstructor.prototype, name));
        });
    });
};
applyMixins(com.google.android.gms.phenotype.Configuration, [com.google.android.gms.common.internal.safeparcel.AbstractSafeParcelable, java.lang.Comparable]);
//# sourceMappingURL=android.js.map
import type { ReactNode } from "react";


type MealColumnProps = {
  title: string;
  children?: ReactNode;
};

function MealColumn({ title, children }: MealColumnProps) {
  return (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export default MealColumn


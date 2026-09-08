const BottomCTA = ({eyebrow, title, discription, link,linktext,link2,link2text}) => {
    return(
        <section className="container">
          <div className="savingsDisclaimer my-10">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
          <p>
            {discription}
          </p>
        </div>
       <div className="flex items-center gap-5">
         <a href={link}>{linktext}</a>

         {
          link2 && (
            <a href={link2}>{link2text}</a>
          )
         }
       </div>
      </div>
      </section>
    )
}

export default BottomCTA;
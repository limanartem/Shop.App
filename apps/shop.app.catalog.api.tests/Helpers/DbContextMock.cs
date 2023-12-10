using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using Moq;
using System.Linq;

namespace Shop.App.Catalog.Api.Tests;

/// <summary>
/// Provides helper methods for mocking DbContext in unit tests.
/// </summary>
public static class DbContextMock
{
  public static TContext GetMock<TData, TContext>(
    List<TData> lstData,
    Expression<Func<TContext, DbSet<TData>>> dbSetSelectionExpression
  ) where TData : class where TContext : DbContext
  {
    Mock<TContext> dbContext = ContextMock(null, lstData, dbSetSelectionExpression);

    return dbContext.Object;
  }

    public static Mock<TContext> ContextMock<TData, TContext>(
      IEnumerable<TData> data,
      Expression<Func<TContext, DbSet<TData>>> dbSetSelectionExpression)
        where TData : class
        where TContext : DbContext
  {
    return ContextMock(null, data, dbSetSelectionExpression);
  }

  public static Mock<TContext> ContextMock<TData, TContext>(
    this Mock<TContext>? mock,
    IEnumerable<TData> data,
    Expression<Func<TContext, DbSet<TData>>> dbSetSelectionExpression)
      where TData : class
      where TContext : DbContext
  {
    var lstData = data.ToList();
    var lstDataQueryable = lstData.AsQueryable<TData>();
    Mock<DbSet<TData>> dbSetMock = new Mock<DbSet<TData>>();
    Mock<TContext> dbContext = mock ?? new Mock<TContext>();

    dbSetMock.As<IQueryable<TData>>().Setup(s => s.Provider).Returns(lstDataQueryable.Provider);
    dbSetMock.As<IQueryable<TData>>().Setup(s => s.Expression).Returns(lstDataQueryable.Expression);
    dbSetMock.As<IQueryable<TData>>().Setup(s => s.ElementType).Returns(lstDataQueryable.ElementType);
    dbSetMock.As<IQueryable<TData>>().Setup(s => s.GetEnumerator()).Returns(() => lstDataQueryable.GetEnumerator());
    dbSetMock.Setup(x => x.Add(It.IsAny<TData>())).Callback<TData>(lstData.Add);
    dbSetMock.Setup(x => x.AddRange(It.IsAny<IEnumerable<TData>>())).Callback<IEnumerable<TData>>(lstData.AddRange);
    dbSetMock.Setup(x => x.Remove(It.IsAny<TData>())).Callback<TData>(t => lstData.Remove(t));
    dbSetMock.Setup(x => x.RemoveRange(It.IsAny<IEnumerable<TData>>())).Callback<IEnumerable<TData>>(ts =>
    {
      foreach (var t in ts) { lstData.Remove(t); }
    });

    dbContext.Setup(dbSetSelectionExpression).Returns(dbSetMock.Object);
    return dbContext;
  }

  public static Mock<TContext> ContextMock<TData, TContext>(
    this Mock<TContext>? mock,
    IAsyncEnumerable<TData> data,
    Expression<Func<TContext, DbSet<TData>>> dbSetSelectionExpression)
      where TData : class
      where TContext : DbContext
  {
    Mock<DbSet<TData>> dbSetMock = new Mock<DbSet<TData>>();
    Mock<TContext> dbContext = mock ?? new Mock<TContext>();
    
    dbSetMock.As<IAsyncEnumerable<TData>>()
      .Setup(s => s.GetAsyncEnumerator(default))
      .Returns(data.GetAsyncEnumerator(default));
    dbSetMock.As<IQueryable<TData>>().Setup(s => s.GetEnumerator()).Returns(() => data.ToEnumerable().GetEnumerator());


    dbContext
      .Setup(dbSetSelectionExpression)
      .Returns(dbSetMock.Object);
    return dbContext;
  }
}